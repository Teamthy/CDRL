import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

/**
 * Audit findings P1-9, P1-10 and P1-12 all came from one middleware:
 *
 *   · P1-9  — a single bucket covered unrelated endpoints, so using one
 *             feature spent the budget of another;
 *   · P1-10 — any store error was forwarded with next(err), turning a Redis
 *             blip into a 500 on every write endpoint on the site;
 *   · P1-12 — login/signup/forgot/reset shared a bucket, so failed sign-ins
 *             locked a user out of the recovery flow that would have fixed it.
 *
 * These tests pin the three properties those fixes rely on: buckets are
 * independent, exhaustion is a 429, and a broken limiter fails OPEN.
 */

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
delete process.env.REDIS_URL;

vi.mock('./logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

type RateLimitModule = typeof import('./rateLimit.js');
let mod: RateLimitModule;

beforeAll(async () => {
    mod = await import('./rateLimit.js');
});

/** Drive a middleware and report what it did. */
function run(
    middleware: ReturnType<RateLimitModule['rateLimit']>,
    ip = '203.0.113.7',
): Promise<{ passed: boolean; status?: number; body?: unknown }> {
    return new Promise((resolve, reject) => {
        const res = {
            statusCode: 200,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            json(body: unknown) {
                resolve({ passed: false, status: this.statusCode, body });
                return this;
            },
        };
        void middleware({ ip } as Request, res as unknown as Response, (err?: unknown) => {
            if (err) reject(err as Error);
            else resolve({ passed: true });
        });
    });
}

describe('rateLimit', () => {
    it('lets requests through while under budget', async () => {
        const mw = mod.rateLimit(mod.createLimiter(`under-${Date.now()}`, 3, 60));
        expect((await run(mw)).passed).toBe(true);
        expect((await run(mw)).passed).toBe(true);
    });

    it('answers 429 once the bucket is empty, without calling next', async () => {
        const mw = mod.rateLimit(mod.createLimiter(`empty-${Date.now()}`, 2, 60));
        await run(mw);
        await run(mw);

        const third = await run(mw);

        expect(third.passed).toBe(false);
        expect(third.status).toBe(429);
        expect(third.body).toMatchObject({ message: expect.stringContaining('Too many requests') });
    });

    it('keeps separate callers in separate buckets', async () => {
        const mw = mod.rateLimit(mod.createLimiter(`per-ip-${Date.now()}`, 1, 60));
        expect((await run(mw, '198.51.100.1')).passed).toBe(true);
        expect((await run(mw, '198.51.100.1')).status).toBe(429);
        // a different client is unaffected
        expect((await run(mw, '198.51.100.2')).passed).toBe(true);
    });

    it('does not let one named bucket spend another’s budget (P1-9, P1-12)', async () => {
        const stamp = Date.now();
        const credentials = mod.rateLimit(mod.createLimiter(`auth-${stamp}`, 1, 60));
        const recovery = mod.rateLimit(mod.createLimiter(`auth-recovery-${stamp}`, 1, 60));

        // burn the login budget, the way a user who mistypes their password does
        expect((await run(credentials)).passed).toBe(true);
        expect((await run(credentials)).status).toBe(429);

        // password recovery must still be reachable
        expect((await run(recovery)).passed).toBe(true);
    });

    it('fails OPEN when the limiter itself errors, instead of 500ing (P1-10)', async () => {
        const broken = {
            consume: async () => {
                throw new Error('redis unreachable');
            },
        } as unknown as Parameters<RateLimitModule['rateLimit']>[0];

        const result = await run(mod.rateLimit(broken));

        expect(result.passed).toBe(true);
    });

    it('supports a custom key so a bucket can be scoped to something other than IP', async () => {
        const mw = mod.rateLimit(mod.createLimiter(`keyed-${Date.now()}`, 1, 60), () => 'one-shared-key');
        expect((await run(mw, '198.51.100.3')).passed).toBe(true);
        // different IP, same key — still throttled
        expect((await run(mw, '198.51.100.4')).status).toBe(429);
    });
});
