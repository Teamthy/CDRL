import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

// Env must exist before importing the admin module (module-level config check).
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.ADMIN_EMAIL = 'founder@example.com';
process.env.ADMIN_PASSWORD = 'correct-horse-battery';
process.env.ADMIN_JWT_SECRET = 'test-secret-test-secret-test-secret-32!';

type Guard = { requireAdmin: (req: Request, res: Response, next: NextFunction) => unknown; signAdminToken: (email: string) => string };
let guard: Guard;

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
    guard = (await import('./admin.js')) as unknown as Guard;
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
        const token = guard.signAdminToken('founder@example.com');
        guard.requireAdmin({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(res.statusCode).toBe(0);
    });
});
