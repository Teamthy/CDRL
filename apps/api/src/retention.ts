import { prisma } from './db.js';
import { logger } from './logger.js';

// ────────────────────────────────────────────────────────────────────────────
// Retention sweeps (audit P1-13)
//
// Three tables grew without bound:
//   · RefreshToken — a row per login AND per rotation, kept for 30 days of
//     validity and then forever. A daily-active learner mints one every two
//     hours; nothing ever deleted them.
//   · LearningPlan — created for any anonymous visitor who clicks "add to
//     plan", keyed by a cookie that expires long before the row does.
//   · Purchase — handled in payments.ts, which owns its own lifecycle.
//
// Each sweep is a single indexed DELETE, safe to run concurrently on several
// instances, and reports what it removed.
// ────────────────────────────────────────────────────────────────────────────

/** Tokens stay deletable for a grace period past expiry so reuse detection still fires. */
export const REFRESH_TOKEN_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/** Anonymous plans are abandoned shopping baskets; six months is generous. */
export const LEARNING_PLAN_RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

/** How often an instance runs the sweeps. */
export const SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Delete refresh tokens that expired long enough ago to be useless.
 *
 * The grace period matters: `rotateRefreshToken` detects token theft by
 * recognising a token it has already seen, and deleting rows the moment they
 * expire would quietly turn a stolen-token replay into "unknown token".
 */
export async function purgeExpiredRefreshTokens(now = Date.now()): Promise<number> {
    const { count } = await prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date(now - REFRESH_TOKEN_RETENTION_MS) } },
    });
    return count;
}

/** Delete learning plans nobody has touched in months. Items cascade. */
export async function purgeStaleLearningPlans(now = Date.now()): Promise<number> {
    const { count } = await prisma.learningPlan.deleteMany({
        where: { updatedAt: { lt: new Date(now - LEARNING_PLAN_RETENTION_MS) } },
    });
    return count;
}

/** Run every sweep, logging the outcome. Never throws. */
export async function runRetentionSweeps(now = Date.now()): Promise<{ refreshTokens: number; learningPlans: number }> {
    const result = { refreshTokens: 0, learningPlans: 0 };
    try {
        result.refreshTokens = await purgeExpiredRefreshTokens(now);
        result.learningPlans = await purgeStaleLearningPlans(now);
        if (result.refreshTokens > 0 || result.learningPlans > 0) {
            logger.info(result, 'retention sweep removed rows');
        }
    } catch (err) {
        // A failed sweep must never take the process down — the data is just
        // older than we would like until the next run.
        logger.warn({ err }, 'retention sweep failed');
    }
    return result;
}

/**
 * Start the periodic sweep.
 *
 * `unref()` keeps the timer from holding the event loop open, so shutdown is
 * unaffected. Returns a stop function for tests and graceful shutdown.
 */
export function startRetentionSweeps(intervalMs = SWEEP_INTERVAL_MS): () => void {
    const timer = setInterval(() => void runRetentionSweeps(), intervalMs);
    timer.unref?.();
    return () => clearInterval(timer);
}
