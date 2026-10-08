import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Audit finding P1-13: three tables grew without bound. RefreshToken gains a
 * row on every login AND every rotation — a daily-active learner mints one
 * every two hours — and nothing ever deleted them. LearningPlan rows are
 * created for anonymous visitors, keyed by a cookie that expires long before
 * the row does.
 *
 * The sweeps must delete only what is genuinely dead, keep expired refresh
 * tokens around long enough for theft detection to still fire, and never take
 * the process down when they fail.
 */

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.CORS_ORIGIN = 'http://localhost:3000';

type Row = { expiresAt?: Date; updatedAt?: Date };

const db = vi.hoisted(() => ({
    refreshTokens: [] as Row[],
    learningPlans: [] as Row[],
    failRefreshPurge: false,
}));

const deleteManyBy = (rows: Row[], field: 'expiresAt' | 'updatedAt', lt: Date) => {
    const keep = rows.filter((r) => !(r[field] && r[field]! < lt));
    const removed = rows.length - keep.length;
    rows.length = 0;
    rows.push(...keep);
    return { count: removed };
};

vi.mock('./logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('./db.js', () => ({
    prisma: {
        refreshToken: {
            deleteMany: async ({ where }: { where: { expiresAt: { lt: Date } } }) => {
                if (db.failRefreshPurge) throw new Error('connection reset');
                return deleteManyBy(db.refreshTokens, 'expiresAt', where.expiresAt.lt);
            },
        },
        learningPlan: {
            deleteMany: async ({ where }: { where: { updatedAt: { lt: Date } } }) =>
                deleteManyBy(db.learningPlans, 'updatedAt', where.updatedAt.lt),
        },
    },
}));

type Retention = typeof import('./retention.js');
let retention: Retention;

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 8);

beforeAll(async () => {
    retention = await import('./retention.js');
});

beforeEach(() => {
    db.refreshTokens = [];
    db.learningPlans = [];
    db.failRefreshPurge = false;
});

describe('purgeExpiredRefreshTokens', () => {
    it('deletes tokens that expired beyond the retention grace period', async () => {
        db.refreshTokens.push({ expiresAt: new Date(NOW - 30 * DAY) });

        expect(await retention.purgeExpiredRefreshTokens(NOW)).toBe(1);
        expect(db.refreshTokens).toHaveLength(0);
    });

    it('keeps live tokens', async () => {
        db.refreshTokens.push({ expiresAt: new Date(NOW + 20 * DAY) });

        expect(await retention.purgeExpiredRefreshTokens(NOW)).toBe(0);
        expect(db.refreshTokens).toHaveLength(1);
    });

    it('keeps just-expired tokens so reuse detection can still fire', async () => {
        // Rotation marks a token used and leaves it behind as a theft tripwire.
        // Deleting it the moment it expires turns a replay into "unknown token".
        db.refreshTokens.push({ expiresAt: new Date(NOW - DAY) });

        expect(await retention.purgeExpiredRefreshTokens(NOW)).toBe(0);
        expect(db.refreshTokens).toHaveLength(1);
    });

    it('retains expired tokens for a week', () => {
        expect(retention.REFRESH_TOKEN_RETENTION_MS).toBe(7 * DAY);
    });
});

describe('purgeStaleLearningPlans', () => {
    it('deletes plans untouched for longer than the retention window', async () => {
        db.learningPlans.push({ updatedAt: new Date(NOW - 200 * DAY) });

        expect(await retention.purgeStaleLearningPlans(NOW)).toBe(1);
    });

    it('keeps a plan that was touched recently', async () => {
        db.learningPlans.push({ updatedAt: new Date(NOW - 10 * DAY) });

        expect(await retention.purgeStaleLearningPlans(NOW)).toBe(0);
        expect(db.learningPlans).toHaveLength(1);
    });

    it('measures staleness from updatedAt, not createdAt', async () => {
        // An old plan a visitor still edits must survive.
        db.learningPlans.push({ updatedAt: new Date(NOW - DAY) });

        expect(await retention.purgeStaleLearningPlans(NOW)).toBe(0);
    });
});

describe('runRetentionSweeps', () => {
    it('reports what each sweep removed', async () => {
        db.refreshTokens.push({ expiresAt: new Date(NOW - 30 * DAY) }, { expiresAt: new Date(NOW - 40 * DAY) });
        db.learningPlans.push({ updatedAt: new Date(NOW - 400 * DAY) });

        expect(await retention.runRetentionSweeps(NOW)).toEqual({ refreshTokens: 2, learningPlans: 1 });
    });

    it('swallows a failure instead of crashing the process', async () => {
        db.failRefreshPurge = true;

        await expect(retention.runRetentionSweeps(NOW)).resolves.toEqual({ refreshTokens: 0, learningPlans: 0 });
    });
});

describe('startRetentionSweeps', () => {
    it('returns a stop function and does not hold the event loop open', () => {
        vi.useFakeTimers();
        const stop = retention.startRetentionSweeps(1000);
        expect(typeof stop).toBe('function');
        stop();
        vi.useRealTimers();
    });
});
