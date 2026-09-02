import { beforeAll, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import type { Principal } from './rbac.js';

// Env must exist before the rbac module (and its config import) load.
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.ADMIN_JWT_SECRET = 'admin-secret-admin-secret-admin-32ABC!';
process.env.LEARNER_JWT_SECRET = 'learner-secret-learner-secret-32xyz!';

// authenticate() resolves learner roles from the DB — mocked so the suite can
// prove role-from-DB truth without a live Postgres.
const lmsUserFindUnique = vi.hoisted(() => ({ fn: vi.fn() }));
vi.mock('./db.js', () => ({ prisma: { lmsUser: { findUnique: lmsUserFindUnique.fn } } }));

type Rbac = typeof import('./rbac.js');
let rbac: Rbac;

beforeAll(async () => {
    rbac = await import('./rbac.js');
});

function mockRes(locals: Record<string, unknown> = {}) {
    const res = {
        statusCode: 0,
        body: undefined as unknown,
        locals: locals as Record<string, unknown>,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            this.body = payload;
            return this;
        },
    };
    return res as unknown as Response & { statusCode: number; body: unknown };
}

describe('permission matrix', () => {
    it('student caps', () => {
        const allowed: Array<'portal:access' | 'enrollment:read-own'> = ['portal:access', 'enrollment:read-own'];
        for (const p of allowed) expect(rbac.hasPermission('student', p)).toBe(true);
        expect(rbac.hasPermission('student', 'enrollment:grade')).toBe(false);
        expect(rbac.hasPermission('student', 'enrollment:read-assigned')).toBe(false);
    });

    it('tutor caps = student + grading', () => {
        expect(rbac.hasPermission('tutor', 'enrollment:grade')).toBe(true);
        expect(rbac.hasPermission('tutor', 'enrollment:read-assigned')).toBe(true);
        expect(rbac.hasPermission('tutor', 'admin:console')).toBe(false);
    });

    it('admin wildcard', () => {
        expect(rbac.hasPermission('admin', 'enrollment:grade')).toBe(true);
        expect(rbac.hasPermission('admin', 'admin:console')).toBe(true);
    });
});

describe('token family isolation (cross-token confusion)', () => {
    it('rejects a learner-audience token against the admin family', () => {
        const t = rbac.signScopedToken('learner', 'u_1', { role: 'tutor' });
        expect(rbac.verifyScopedToken('admin', t)).toBeNull();
    });

    it('rejects an admin token against the learner family', () => {
        const t = rbac.signScopedToken('admin', 'founder@example.com');
        expect(rbac.verifyScopedToken('learner', t)).toBeNull();
    });

    it('rejects legacy tokens with no iss/aud', () => {
        const t = jwt.sign({ sub: 'u_1' }, 'learner-secret-learner-secret-32xyz!');
        expect(rbac.verifyScopedToken('learner', t)).toBeNull();
    });

    it('round-trips within family', () => {
        const t = rbac.signScopedToken('learner', 'u_9', { role: 'student' });
        const payload = rbac.verifyScopedToken('learner', t);
        expect(payload?.sub).toBe('u_9');
        expect(payload?.aud).toBe('learner');
        expect(payload?.iss).toBe('ykay-api');
    });
});

describe('authenticate()', () => {
    it('resolves admin principals without touching the DB', async () => {
        const res = mockRes();
        const next = vi.fn();
        const token = rbac.signScopedToken('admin', 'founder@example.com');
        await rbac.authenticate({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, next);
        const principal = res.locals.principal as Principal | null;
        expect(next).toHaveBeenCalled();
        expect(principal).toEqual({ kind: 'admin', email: 'founder@example.com', role: 'admin' });
        expect(lmsUserFindUnique.fn).not.toHaveBeenCalled();
    });

    it('role comes from the DB, not the token claim', async () => {
        lmsUserFindUnique.fn.mockResolvedValueOnce({ id: 'u_7', role: 'tutor', status: 'active' });
        const res = mockRes();
        const next = vi.fn();
        // Token CLAIMS student; DB says tutor → DB must win.
        const token = rbac.signScopedToken('learner', 'u_7', { role: 'student' });
        await rbac.authenticate({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, next);
        const principal = res.locals.principal as Principal | null;
        expect(principal && principal.kind === 'learner' && principal.role).toBe('tutor');
    });

    it('suspended accounts become authError, not a principal', async () => {
        lmsUserFindUnique.fn.mockResolvedValueOnce({ id: 'u_8', role: 'student', status: 'suspended' });
        const res = mockRes();
        const token = rbac.signScopedToken('learner', 'u_8');
        await rbac.authenticate({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, vi.fn());
        expect(res.locals.principal).toBeNull();
        expect(res.locals.authError).toBe('suspended');
    });

    it('missing account → gone', async () => {
        lmsUserFindUnique.fn.mockResolvedValueOnce(null);
        const res = mockRes();
        const token = rbac.signScopedToken('learner', 'u_404');
        await rbac.authenticate({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, vi.fn());
        expect(res.locals.authError).toBe('gone');
    });

    it('no header → none, no DB call', async () => {
        lmsUserFindUnique.fn.mockClear();
        const res = mockRes();
        await rbac.authenticate({ headers: {} } as Request, res, vi.fn());
        expect(res.locals.authError).toBe('none');
        expect(res.locals.principal).toBeNull();
        expect(lmsUserFindUnique.fn).not.toHaveBeenCalled();
    });
});

describe('requirePermission() — 401 vs 403 discipline', () => {
    it('401 when unauthenticated', () => {
        const grade = rbac.requirePermission('enrollment:grade');
        const res = mockRes({ principal: null, authError: 'none' });
        const next = vi.fn();
        grade({} as Request, res, next);
        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('403 for suspended', () => {
        const grade = rbac.requirePermission('enrollment:grade');
        const res = mockRes({ principal: null, authError: 'suspended' });
        grade({} as Request, res, vi.fn());
        expect(res.statusCode).toBe(403);
    });

    it('403 when a student asks to grade', () => {
        const grade = rbac.requirePermission('enrollment:grade');
        const res = mockRes({ principal: { kind: 'learner', userId: 'u_s', role: 'student', status: 'active' } });
        grade({} as Request, res, vi.fn());
        expect(res.statusCode).toBe(403);
    });

    it('tutor with the permission passes', () => {
        const grade = rbac.requirePermission('enrollment:grade');
        const res = mockRes({ principal: { kind: 'learner', userId: 'u_t', role: 'tutor', status: 'active' } });
        const next = vi.fn();
        grade({} as Request, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('admin wildcard passes any permission', () => {
        const res = mockRes({ principal: { kind: 'admin', email: 'a@b.c', role: 'admin' } });
        const next = vi.fn();
        rbac.requirePermission('admin:console')({} as Request, res, next);
        expect(next).toHaveBeenCalled();
    });
});
