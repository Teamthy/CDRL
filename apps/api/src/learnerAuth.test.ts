import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

// Env must exist before importing the learner module (module-level config check).
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.LEARNER_JWT_SECRET = 'learner-secret-learner-secret-32xyz!';

// Keep the generated Prisma client out of this suite so it loads on a fresh clone,
// where `prisma generate` has not run. The only query the routes below make is the
// user lookup in /forgot-password, which is stubbed here.
const db = vi.hoisted(() => ({
    lmsUser: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    refreshToken: { updateMany: vi.fn() },
}));
vi.mock('./db.js', () => ({ prisma: db }));
vi.mock('./logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { logger } from './logger.js';

type LearnerAuth = {
    requireLearner: (req: Request, res: Response, next: NextFunction) => unknown;
    signLearnerToken: (userId: string) => string;
    issueResetToken: (user: { id: string; email: string; passwordHash: string | null }) => string;
    verifyResetToken: (token: string, user: { id: string; email: string; passwordHash: string | null }) => boolean;
    learnerRouter: unknown;
    issueInviteLink: (user: { id: string; email: string; passwordHash: string | null }) => { link: string; expiresInDays: number };
    issueInviteToken: (user: { id: string; email: string; passwordHash: string | null }) => string;
    inviteBlocker: (user: { passwordHash: string | null; status: string }, enabled?: boolean) => { status: number; message: string } | null;
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

type Handler = (req: Request, res: Response, next: NextFunction) => unknown;

/** The final handler of a learner route, so it can be driven without Express. */
function routeHandler(method: 'post', path: string): Handler {
    const stack = (auth.learnerRouter as { stack: { route?: { path: string; methods: Record<string, boolean>; stack: { handle: Handler }[] } }[] }).stack;
    const layer = stack.find((l) => l.route?.path === path && l.route.methods[method]);
    if (!layer) throw new Error(`no ${method} ${path} route`);
    const handlers = layer.route!.stack;
    return handlers[handlers.length - 1]!.handle;
}

/** Run a route and resolve with what it answered, plus any Set-Cookie headers it wrote. */
function callRoute(handler: Handler, req: Partial<Request>) {
    return new Promise<{ status: number; body: unknown; cookies: string[] }>((resolve, reject) => {
        const cookies: string[] = [];
        const res = {
            statusCode: 200,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            setHeader(name: string, value: string) {
                if (name === 'Set-Cookie') cookies.push(value);
            },
            json(body: unknown) {
                resolve({ status: this.statusCode, body, cookies });
                return this;
            },
            send(body?: unknown) {
                resolve({ status: this.statusCode, body, cookies });
                return this;
            },
            sendStatus(code: number) {
                this.statusCode = code;
                resolve({ status: code, body: undefined, cookies });
                return this;
            },
        };
        handler(req as Request, res as unknown as Response, (err) => reject(err ?? new Error('next() called')));
    });
}

describe('POST /logout', () => {
    // The refresh cookie is SameSite=None, so a cross-site POST would carry it.
    it('refuses a cross-site Origin before it touches the session', async () => {
        const res = await callRoute(routeHandler('post', '/logout'), {
            headers: { origin: 'https://evil.example' } as Request['headers'],
            body: {},
        });
        expect(res.status).toBe(403);
        expect(res.cookies).toEqual([]);
    });

    it('signs out from an allowlisted origin and clears the refresh cookie', async () => {
        const res = await callRoute(routeHandler('post', '/logout'), {
            headers: { origin: 'http://localhost:3000' } as Request['headers'],
            body: {},
        });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
        expect(res.cookies).toHaveLength(1);
        expect(res.cookies[0]).toContain('Max-Age=0');
    });

    it('still answers requests with no Origin, as /refresh does for curl and server-to-server calls', async () => {
        const res = await callRoute(routeHandler('post', '/logout'), { headers: {} as Request['headers'], body: {} });
        expect(res.status).toBe(200);
    });
});

describe('POST /forgot-password without SMTP', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('never writes the reset link or its token to the logs', async () => {
        db.lmsUser.findUnique.mockResolvedValueOnce({
            id: 'u_1',
            email: 'alice@example.com',
            name: 'Alice',
            status: 'active',
            passwordHash: '$2b$10$abc',
        });
        const res = await callRoute(routeHandler('post', '/forgot-password'), {
            headers: {} as Request['headers'],
            body: { email: 'alice@example.com' },
        });
        expect(res.body).toMatchObject({ ok: true });

        const logged = [...vi.mocked(logger.info).mock.calls, ...vi.mocked(logger.warn).mock.calls, ...vi.mocked(logger.error).mock.calls];
        // Reset tokens are signed JWTs (they start with "eyJ") and the link carries them as ?reset=.
        expect(JSON.stringify(logged)).not.toMatch(/reset=|eyJ/);
        expect(logger.warn).toHaveBeenCalledWith({ userId: 'u_1' }, expect.stringContaining('not sent'));
    });
});

const invitee = { id: 'u_9', email: 'bola@example.com', passwordHash: null as string | null, status: 'active' };

describe('invite links', () => {
    it('gives a sign-in link whose token works until a password is set', () => {
        const { link, expiresInDays } = auth.issueInviteLink(invitee);
        expect(expiresInDays).toBe(7);
        expect(link).toMatch(/\/sign-in\?reset=/);
        const token = new URL(link).searchParams.get('reset') ?? '';
        expect(auth.verifyResetToken(token, invitee)).toBe(true);
        // Setting a password changes the fingerprint, so the invite is spent.
        expect(auth.verifyResetToken(token, { ...invitee, passwordHash: '$2b$10$new' })).toBe(false);
    });

    it('expires seven days after it is issued', () => {
        const claims = jwt.decode(auth.issueInviteToken(invitee)) as { iat: number; exp: number; kind: string };
        expect(claims.kind).toBe('invite');
        expect(claims.exp - claims.iat).toBe(7 * 24 * 60 * 60);
    });

    it('is refused for accounts with a password, suspended accounts, and when learner accounts are off', () => {
        expect(auth.inviteBlocker({ passwordHash: '$2b$10$x', status: 'active' })?.status).toBe(409);
        expect(auth.inviteBlocker({ passwordHash: null, status: 'suspended' })?.status).toBe(409);
        expect(auth.inviteBlocker({ passwordHash: null, status: 'active' })).toBeNull();
        expect(auth.inviteBlocker({ passwordHash: null, status: 'active' }, false)?.status).toBe(503);
    });
});

describe('signup and invites', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not let signup claim an admin-created account that has no password', async () => {
        db.lmsUser.findUnique.mockResolvedValueOnce({ id: 'u_9', email: 'bola@example.com', passwordHash: null });
        const out = await callRoute(routeHandler('post', '/signup'), {
            body: { name: 'Mallory', email: 'bola@example.com', password: 'hunter2hunter2' },
            headers: {} as Request['headers'],
        });
        expect(out.status).toBe(409);
        expect(db.lmsUser.create).not.toHaveBeenCalled();
        expect(db.lmsUser.update).not.toHaveBeenCalled();
    });

    it('lets the invitee set the first password once, then refuses the same link', async () => {
        const { link } = auth.issueInviteLink(invitee);
        const token = new URL(link).searchParams.get('reset') ?? '';
        const reset = routeHandler('post', '/reset-password');

        db.lmsUser.findUnique.mockResolvedValueOnce(invitee);
        const first = await callRoute(reset, { body: { token, password: 'a-new-password' }, headers: {} as Request['headers'] });
        expect(first.body).toMatchObject({ ok: true });
        expect(db.lmsUser.update).toHaveBeenCalledTimes(1);

        // The account now has a password, so the same link no longer matches it.
        db.lmsUser.findUnique.mockResolvedValueOnce({ ...invitee, passwordHash: '$2b$10$set' });
        const second = await callRoute(reset, { body: { token, password: 'another-password' }, headers: {} as Request['headers'] });
        expect(second.status).toBe(400);
        expect(db.lmsUser.update).toHaveBeenCalledTimes(1);
    });
});

