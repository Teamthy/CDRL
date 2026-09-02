import { beforeAll, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

// Env must exist before importing the learner module (module-level config check).
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.LEARNER_JWT_SECRET = 'learner-secret-learner-secret-32xyz!';

type LearnerAuth = {
    requireLearner: (req: Request, res: Response, next: NextFunction) => unknown;
    signLearnerToken: (userId: string) => string;
    issueResetToken: (user: { id: string; email: string; passwordHash: string | null }) => string;
    verifyResetToken: (token: string, user: { id: string; email: string; passwordHash: string | null }) => boolean;
};
let auth: LearnerAuth;

function mockRes() {
    const res = {
        statusCode: 0,
        body: undefined as unknown,
        locals: {} as Record<string, unknown>,
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
    auth = (await import('./learnerAuth.js')) as unknown as LearnerAuth;
});

const alice = { id: 'u_1', email: 'alice@example.com', passwordHash: '$2b$10$abc' };

describe('requireLearner', () => {
    it('rejects requests without a token', () => {
        const res = mockRes();
        const next = vi.fn();
        auth.requireLearner({ headers: {} } as Request, res, next);
        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects an admin-role token on learner routes', () => {
        const res = mockRes();
        const next = vi.fn();
        // Signed with the LEARNER secret but carrying the wrong role.
        const token = jwt.sign({ sub: 'u_9', role: 'admin' }, 'learner-secret-learner-secret-32xyz!');
        auth.requireLearner({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, next);
        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('admits a valid learner token and stashes the user id', () => {
        const res = mockRes();
        const next = vi.fn();
        const token = auth.signLearnerToken('u_42');
        auth.requireLearner({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res, next);
        expect(res.statusCode).toBe(0);
        expect(next).toHaveBeenCalled();
        expect(res.locals.learnerUserId).toBe('u_42');
    });
});

describe('reset tokens', () => {
    it('issue → verify round-trips for the same password state', () => {
        const token = auth.issueResetToken(alice);
        expect(auth.verifyResetToken(token, alice)).toBe(true);
    });

    it('dies once the password hash changes (single-use)', () => {
        const token = auth.issueResetToken(alice);
        expect(auth.verifyResetToken(token, { ...alice, passwordHash: '$2b$10$newhash' })).toBe(false);
    });

    it('dies for a different user id', () => {
        const token = auth.issueResetToken(alice);
        expect(auth.verifyResetToken(token, { ...alice, id: 'u_2' })).toBe(false);
    });

    it('rejects garbage', () => {
        expect(auth.verifyResetToken('not-a-jwt', alice)).toBe(false);
    });
});
