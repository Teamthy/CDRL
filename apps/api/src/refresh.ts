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
//   · if a USED token is ever presented again → token theft signal → the whole
//     family is revoked. Legit holders never replay; only an attacker does.
//   · Origin header must match the CORS allowlist (CSRF shield for the cookie).
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

export async function rotateRefreshToken(presented: string): Promise<RotateResult> {
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(presented) } });
    if (!row) return { ok: false, reason: 'invalid' };
    if (row.revokedAt) return { ok: false, reason: 'revoked' };
    if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };
    if (row.usedAt) {
        // Reuse of a rotated token → treat as theft; kill the family.
        await prisma.refreshToken.updateMany({
            where: { familyId: row.familyId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        logger.warn({ familyId: row.familyId }, 'refresh-token reuse detected — family revoked');
        return { ok: false, reason: 'reuse' };
    }
    await prisma.refreshToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    const newToken = await issueRefreshToken(row.userId, row.familyId);
    return { ok: true, userId: row.userId, familyId: row.familyId, newToken };
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
