import { createHash, randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { prisma } from './db.js';
import { logger } from './logger.js';
import { corsOrigins } from './config.js';

// ────────────────────────────────────────────────────────────────────────────
// Refresh-token rotation (patch-25) — the industry-standard hardening step:
//   · access JWT stays short-ish (2h) in localStorage
//   · refresh lives in an httpOnly SameSite=None cookie JS can never read
//   · every refresh ROTATES: old token is marked used, a new one is issued
//   · if a USED token is presented again LONG after it was rotated → token theft
//     signal → the whole family is revoked.
//   · Origin header must match the CORS allowlist (CSRF shield for the cookie).
//
// Concurrency (audit P0-2): "legit holders never replay" was wrong. Two tabs
// waking at once, or a retried request whose first response was lost, both
// present the SAME cookie — the browser has only one. The old read-then-update
// also let both callers pass the usedAt check before either wrote, so the loser
// revoked the entire family and signed the user out everywhere. Two guards now:
//   1. the claim is ATOMIC (updateMany … where usedAt:null, count === 1 wins)
//   2. a short REUSE_GRACE_MS window treats a replay as a benign double-submit
//      and re-issues, because real theft shows up minutes/hours later, not in
//      the same handful of seconds.
// No cookie-parser dependency — the cookie line is parsed by hand below.
// ────────────────────────────────────────────────────────────────────────────

export const REFRESH_COOKIE = 'ykh_refresh';
const COOKIE_PATH = '/api/v1/learner';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function readRefreshCookie(req: Request): string | null {
    const header = req.headers.cookie ?? '';
    const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${REFRESH_COOKIE}=`));
    const value = match?.slice(REFRESH_COOKIE.length + 1);
    return value ? decodeURIComponent(value) : null;
}

export function setRefreshCookie(res: Response, token: string, maxAgeMs = REFRESH_TTL_MS) {
    const parts = [
        `${REFRESH_COOKIE}=${encodeURIComponent(token)}`,
        'HttpOnly',
        'Secure',
        'SameSite=None', // Netlify ↔ Render are cross-site by design; Origin check guards CSRF
        `Path=${COOKIE_PATH}`,
        `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    ];
    res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearRefreshCookie(res: Response) {
    setRefreshCookie(res, '', 0);
}

const newToken = () => randomBytes(48).toString('base64url');

export async function issueRefreshToken(userId: string, familyId = randomBytes(12).toString('hex')): Promise<string> {
    const token = newToken();
    await prisma.refreshToken.create({
        data: {
            userId,
            familyId,
            tokenHash: sha256(token),
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
    });
    return token;
}

export type RotateResult =
    | { ok: true; userId: string; familyId: string; newToken: string }
    | { ok: false; reason: 'invalid' | 'expired' | 'revoked' | 'reuse' };

/** How long after rotation a replay of the same token is still forgiven. */
export const REUSE_GRACE_MS = 10_000;

export async function rotateRefreshToken(presented: string): Promise<RotateResult> {
    const tokenHash = sha256(presented);
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!row) return { ok: false, reason: 'invalid' };
    if (row.revokedAt) return { ok: false, reason: 'revoked' };
    if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };

    // Atomic claim. tokenHash is @unique, so this matches at most one row and
    // exactly one concurrent caller can flip usedAt from null → now.
    const claim = await prisma.refreshToken.updateMany({
        where: { tokenHash, usedAt: null, revokedAt: null },
        data: { usedAt: new Date() },
    });
    if (claim.count === 1) {
        const newToken = await issueRefreshToken(row.userId, row.familyId);
        return { ok: true, userId: row.userId, familyId: row.familyId, newToken };
    }

    // We did not win the claim: the token was already used. Re-read to find out
    // how long ago, since the row we loaded above may be stale.
    const current = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!current) return { ok: false, reason: 'invalid' };
    if (current.revokedAt) return { ok: false, reason: 'revoked' };

    const usedAgo = Date.now() - (current.usedAt?.getTime() ?? 0);
    if (current.usedAt && usedAgo <= REUSE_GRACE_MS) {
        // Benign double-submit (second tab, retry, lost response). Hand out a
        // fresh token in the SAME family rather than revoking the session.
        logger.info({ familyId: current.familyId, usedAgo }, 'concurrent refresh within grace window — re-issued');
        const newToken = await issueRefreshToken(current.userId, current.familyId);
        return { ok: true, userId: current.userId, familyId: current.familyId, newToken };
    }

    // A replay long after rotation is the theft signal — kill the family.
    await prisma.refreshToken.updateMany({
        where: { familyId: current.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
    logger.warn({ familyId: current.familyId, usedAgo }, 'refresh-token reuse detected — family revoked');
    return { ok: false, reason: 'reuse' };
}

export async function revokeFamily(familyId: string) {
    await prisma.refreshToken.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}

export async function revokePresented(presented: string): Promise<void> {
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(presented) } });
    if (row) {
        await prisma.refreshToken.updateMany({
            where: { familyId: row.familyId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}

export async function revokeAllForUser(userId: string) {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}

/** CSRF shield for cookie endpoints: Origin must be an allowlisted site origin (or absent same-origin curl). */
export function assertAllowedOrigin(req: Request, res: Response): boolean {
    const origin = req.headers.origin;
    if (!origin) return true; // curl/server-to-server; browsers always send Origin for cross-site
    if (corsOrigins.includes(origin)) return true;
    res.status(403).json({ message: 'Origin not allowed' });
    return false;
}
