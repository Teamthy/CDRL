import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

// Env must exist before importing the admin module (module-level config check).
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'correct-horse-battery';
process.env.ADMIN_JWT_SECRET = 'test-secret-test-secret-test-secret-32!';

// The guard is pure. Keep the generated Prisma client out so the suite loads on a
// fresh clone (admin.ts only uses Prisma.PrismaClientKnownRequestError inside handlers).
vi.mock('./db.js', () => ({ prisma: {} }));
vi.mock('@prisma/client', () => ({ Prisma: { PrismaClientKnownRequestError: class extends Error {} } }));

type Guard = { requireAdmin: (req: Request, res: Response, next: NextFunction) => unknown; signAdminToken: (email: string) => string };
let guard: Guard;
let lmsUserView: (user: { passwordHash: string | null }) => Record<string, unknown>;

function mockRes() {
    const res = {
        statusCode: 0,
        body: undefined as unknown,
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

beforeAll(async () => {
    const admin = await import('./admin.js');
    guard = admin as unknown as Guard;
    lmsUserView = admin.lmsUserView;
});

describe('requireAdmin', () => {
    it('rejects requests without a token', () => {
        const res = mockRes();
        const next = vi.fn();
        guard.requireAdmin({ headers: {} } as Request, res, next);
        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects a token signed with the wrong secret', () => {
        const res = mockRes();
        const next = vi.fn();
        const fake = 'Bearer eyJhbGciOiJIUzI1NiJ9.invalid.signature';
        guard.requireAdmin({ headers: { authorization: fake } } as unknown as Request, res, next);
        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('admits a valid token from signAdminToken', () => {
        const res = mockRes();
        const next = vi.fn();
        const token = guard.signAdminToken('admin@example.com');
        guard.requireAdmin({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(res.statusCode).toBe(0);
    });
});

describe('lmsUserView', () => {
    it('never returns the password hash, and says whether one is set', () => {
        const withPassword = lmsUserView({ id: 'u_1', email: 'a@example.com', passwordHash: '$2b$10$secret' } as never);
        expect(JSON.stringify(withPassword)).not.toContain('$2b$10$secret');
        expect(withPassword).toMatchObject({ id: 'u_1', hasPassword: true });
        expect(lmsUserView({ id: 'u_2', email: 'b@example.com', passwordHash: null } as never)).toMatchObject({ hasPassword: false });
    });
});

