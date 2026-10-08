import type { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis';
import { RateLimiterMemory, RateLimiterRedis, type RateLimiterAbstract } from 'rate-limiter-flexible';
import { config } from './config.js';
import { logger } from './logger.js';

// ────────────────────────────────────────────────────────────────────────────
// Rate limiting (shared via Redis when REDIS_URL is set)
//
// Lives in its own module so every router can reach the same store — payments
// previously had no limiter at all simply because the middleware was private
// to index.ts (audit P1-11).
// ────────────────────────────────────────────────────────────────────────────

let redis: Redis | null = null;
if (config.REDIS_URL) {
    redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
    redis.on('error', (err) => logger.warn({ err }, 'redis error (rate limiter store)'));
    logger.info('rate limiting backed by Redis');
} else if (config.NODE_ENV === 'production') {
    logger.warn('REDIS_URL not set — in-memory rate limiting only works correctly on a single instance');
}

/**
 * Build one named bucket.
 *
 * When Redis is configured it also gets an in-process `insuranceLimiter`, which
 * rate-limiter-flexible uses automatically if the store is unreachable. A Redis
 * outage therefore degrades to per-instance limiting instead of rejecting the
 * request (audit P1-10 — the old code called `next(err)` on any store failure,
 * turning a Redis blip into a 500 on every write endpoint).
 */
export function createLimiter(name: string, points: number, duration: number): RateLimiterAbstract {
    if (redis) {
        return new RateLimiterRedis({
            storeClient: redis,
            points,
            duration,
            keyPrefix: `cdrl:rl:${name}`,
            insuranceLimiter: new RateLimiterMemory({ points, duration }),
        });
    }
    return new RateLimiterMemory({ points, duration });
}

/** Middleware factory: consume one point per request, keyed by client IP. */
export function rateLimit(limiter: RateLimiterAbstract, key?: (req: Request) => string) {
    return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
        try {
            await limiter.consume(key ? key(req) : (req.ip ?? 'unknown'));
            next();
        } catch (err) {
            if (err instanceof Error) {
                // Both the store AND its in-memory insurance failed. Logging and
                // allowing the request through beats a blanket 500 on every form
                // on the site; the endpoint's own validation still applies.
                logger.error({ err }, 'rate limiter unavailable — allowing request through');
                next();
                return;
            }
            res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
        }
    };
}

/**
 * Separate buckets per concern (audit P1-9).
 *
 * One 6/min bucket used to cover contact forms, applications AND every
 * learning-plan mutation, so a visitor who added seven courses to their plan
 * could no longer send a contact enquiry. Human-submitted forms stay on the
 * strict configured budget; learning-plan edits are ordinary UI clicks and get
 * a bucket sized for clicking.
 */
export const rateLimitSubmissions = rateLimit(
    createLimiter('submit', config.RATE_LIMIT_POINTS, config.RATE_LIMIT_DURATION),
);

export const rateLimitPlanEdits = rateLimit(createLimiter('plan', 60, config.RATE_LIMIT_DURATION));

/**
 * Checkout: each call creates a purchase row and hits Paystack's API, so this
 * is both a cost and a spam vector. Low enough to stop a script, high enough
 * that a shopper who changes their mind twice is unaffected.
 */
export const rateLimitPaymentInit = rateLimit(createLimiter('pay-init', 10, 60));

/**
 * Verification is polled by the callback page, and a learner refreshing a
 * stuck "confirming your payment" screen must never be locked out of their
 * own purchase — so this bucket is deliberately generous.
 */
export const rateLimitPaymentVerify = rateLimit(createLimiter('pay-verify', 60, 60));

/** Close the shared store on shutdown. */
export async function closeRateLimitStore(): Promise<void> {
    if (redis) await redis.quit();
}
