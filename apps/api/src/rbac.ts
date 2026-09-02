import type { NextFunction, Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from './config.js';
import { prisma } from './db.js';

// ────────────────────────────────────────────────────────────────────────────
// RBAC (patch-23): one matrix, one authenticate(), one requirePermission().
//
// Roles:   admin (env-configured console), tutor, student (both from LmsUser.role)
// Tokens:  JWT with iss/aud claims — an admin token can never be replayed against
//          learner routes and vice versa (cross-token confusion defense).
// AuthZ:   permissions are checked against the ROLE FROM THE DATABASE (not the
//          token claim), so role changes & suspensions apply immediately.
// Ownership scoping lives in the route handlers (tutor → own enrollments only,
// student → own enrollments) — the matrix decides *caps*, handlers decide *rows*.
// ────────────────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'tutor' | 'student';

export type Permission =
    | 'portal:access' // any authenticated learner/tutor (dashboard, modules, certs)
    | 'enrollment:read-own'
    | 'enrollment:read-assigned'
    | 'enrollment:grade'
    | 'admin:console';

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[] | '*' > = {
    admin: '*',
    tutor: ['portal:access', 'enrollment:read-own', 'enrollment:read-assigned', 'enrollment:grade'],
    student: ['portal:access', 'enrollment:read-own'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
    const caps = ROLE_PERMISSIONS[role];
    return caps === '*' || caps.includes(permission);
}

export type Principal =
    | { kind: 'admin'; email: string; role: 'admin' }
    | { kind: 'learner'; userId: string; role: 'student' | 'tutor'; status: string };

const ISSUER = 'ykay-api';
export const JWT_ISSUER = ISSUER;

export function signScopedToken(
    kind: 'admin' | 'learner',
    subject: string,
    extra: Record<string, string> = {},
    expiresIn: SignOptions['expiresIn'] = '12h',
): string {
    const secret = kind === 'admin' ? config.ADMIN_JWT_SECRET : config.LEARNER_JWT_SECRET;
    if (!secret) throw new Error(`${kind} auth not configured`);
    return jwt.sign({ sub: subject, role: kind === 'admin' ? 'admin' : (extra.role ?? 'learner'), ...extra }, secret, {
        expiresIn,
        issuer: ISSUER,
        audience: kind,
    });
}

export function verifyScopedToken(kind: 'admin' | 'learner', token: string): jwt.JwtPayload | null {
    const secret = kind === 'admin' ? config.ADMIN_JWT_SECRET : config.LEARNER_JWT_SECRET;
    if (!secret) return null;
    try {
        return jwt.verify(token, secret, { issuer: ISSUER, audience: kind }) as jwt.JwtPayload;
    } catch {
        return null;
    }
}

/** Identifies the caller once, from either token family. Role comes from the DB. */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    res.locals.principal = null;
    res.locals.authError = token ? null : 'none';
    if (!token) return next();

    // Admin token?
    const adminPayload = verifyScopedToken('admin', token);
    if (adminPayload?.sub && adminPayload.role === 'admin') {
        res.locals.principal = { kind: 'admin', email: adminPayload.sub, role: 'admin' } satisfies Principal;
        return next();
    }

    // Learner token? Role + status are read fresh so suspensions apply instantly.
    const learnerPayload = verifyScopedToken('learner', token);
    if (learnerPayload?.sub) {
        const user = await prisma.lmsUser.findUnique({ where: { id: learnerPayload.sub as string } });
        if (!user) {
            res.locals.authError = 'gone';
        } else if (user.status === 'suspended') {
            res.locals.authError = 'suspended';
        } else {
            res.locals.principal = {
                kind: 'learner',
                userId: user.id,
                role: user.role === 'tutor' ? 'tutor' : 'student',
                status: user.status,
            } satisfies Principal;
        }
    } else {
        res.locals.authError = 'bad-token';
    }
    return next();
}

/** 401 when unauthenticated, 403 when authenticated but without the permission. */
export function requirePermission(permission: Permission) {
    return (_req: Request, res: Response, next: NextFunction) => {
        const principal = res.locals.principal as Principal | null;
        if (!principal) {
            if (res.locals.authError === 'suspended') {
                return res.status(403).json({ message: 'This account is suspended — contact the school.' });
            }
            if (res.locals.authError === 'gone') {
                return res.status(401).json({ message: 'Account no longer exists' });
            }
            return res.status(401).json({ message: 'Sign in first' });
        }
        if (!hasPermission(principal.role, permission)) {
            return res.status(403).json({ message: 'Your role does not allow this action.' });
        }
        return next();
    };
}
