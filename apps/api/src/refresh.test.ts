import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Audit finding P0-2: rotateRefreshToken read the row, checked `usedAt`, then
 * wrote — non-atomically. Two tabs refreshing at the same moment both passed the
 * check, the loser landed in the `usedAt` branch, and the whole token family was
 * revoked: the learner was signed out on every device.
 *
 * These tests drive a tiny in-memory stand-in for the RefreshToken table whose
 * updateMany honours the `usedAt: null` predicate the real database enforces, so
 * "exactly one caller may claim the token" is actually exercised.
 */

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.LEARNER_JWT_SECRET = 'learner-secret-learner-secret-32xyz!';

type Row = {
    id: string;
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
};

const store = vi.hoisted(() => ({ rows: [] as Row[], seq: 0 }));

function matches(row: Row, where: Record<string, unknown>): boolean {
    for (const [key, expected] of Object.entries(where)) {
        const actual = (row as unknown as Record<string, unknown>)[key];
        if (expected === null) {
            if (actual !== null) return false;
        } else if (actual !== expected) {
            return false;
        }
    }
    return true;
}

vi.mock('./db.js', () => ({
    prisma: {
        refreshToken: {
            findUnique: async ({ where }: { where: { tokenHash: string } }) =>
                store.rows.find((r) => r.tokenHash === where.tokenHash) ?? null,
            create: async ({ data }: { data: Omit<Row, 'id' | 'usedAt' | 'revokedAt'> }) => {
                const row: Row = { id: `r${++store.seq}`, usedAt: null, revokedAt: null, ...data };
                store.rows.push(row);
                return row;
            },
            update: async ({ where, data }: { where: { id: string }; data: Partial<Row> }) => {
                const row = store.rows.find((r) => r.id === where.id);
                if (!row) throw new Error('record not found');
                Object.assign(row, data);
                return row;
            },
            updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<Row> }) => {
                const hit = store.rows.filter((r) => matches(r, where));
                for (const r of hit) Object.assign(r, data);
                return { count: hit.length };
            },
        },
    },
}));

vi.mock('./logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

type RefreshModule = typeof import('./refresh.js');
let refresh: RefreshModule;

beforeAll(async () => {
    refresh = await import('./refresh.js');
});

beforeEach(() => {
    store.rows = [];
    store.seq = 0;
});

/** The only handle on a freshly issued token is its plaintext value. */
async function issue(userId = 'user-1') {
    return refresh.issueRefreshToken(userId);
}

describe('rotateRefreshToken', () => {
    it('rotates a valid token and keeps the family', async () => {
        const token = await issue();
        const result = await refresh.rotateRefreshToken(token);

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.userId).toBe('user-1');
        expect(result.newToken).not.toBe(token);
        expect(store.rows.every((r) => r.familyId === result.familyId)).toBe(true);
    });

    it('marks the presented token used so it cannot rotate twice freely', async () => {
        const token = await issue();
        await refresh.rotateRefreshToken(token);
        const used = store.rows.find((r) => r.usedAt !== null);
        expect(used).toBeTruthy();
    });

    it('two concurrent rotations both succeed and the family survives', async () => {
        const token = await issue();

        const [a, b] = await Promise.all([
            refresh.rotateRefreshToken(token),
            refresh.rotateRefreshToken(token),
        ]);

        expect(a.ok).toBe(true);
        expect(b.ok).toBe(true);
        // The decisive assertion: nothing was revoked, so the learner stays
        // signed in in both tabs.
        expect(store.rows.some((r) => r.revokedAt !== null)).toBe(false);
        if (a.ok && b.ok) expect(a.newToken).not.toBe(b.newToken);
    });

    it('forgives a replay inside the grace window by re-issuing', async () => {
        const token = await issue();
        await refresh.rotateRefreshToken(token);

        const replay = await refresh.rotateRefreshToken(token);

        expect(replay.ok).toBe(true);
        expect(store.rows.some((r) => r.revokedAt !== null)).toBe(false);
    });

    it('revokes the family when a used token is replayed after the grace window', async () => {
        const token = await issue();
        const rotated = await refresh.rotateRefreshToken(token);
        expect(rotated.ok).toBe(true);

        // Age the rotation past the grace window.
        const used = store.rows.find((r) => r.usedAt !== null)!;
        used.usedAt = new Date(Date.now() - refresh.REUSE_GRACE_MS - 1_000);

        const replay = await refresh.rotateRefreshToken(token);

        expect(replay.ok).toBe(false);
        if (replay.ok) return;
        expect(replay.reason).toBe('reuse');
        expect(store.rows.every((r) => r.revokedAt !== null)).toBe(true);
    });

    it('rejects unknown, revoked and expired tokens', async () => {
        const unknown = await refresh.rotateRefreshToken('nope');
        expect(unknown).toEqual({ ok: false, reason: 'invalid' });

        const revokedToken = await issue();
        store.rows[0]!.revokedAt = new Date();
        expect(await refresh.rotateRefreshToken(revokedToken)).toEqual({ ok: false, reason: 'revoked' });

        store.rows = [];
        const expiredToken = await issue();
        store.rows[0]!.expiresAt = new Date(Date.now() - 1_000);
        expect(await refresh.rotateRefreshToken(expiredToken)).toEqual({ ok: false, reason: 'expired' });
    });
});
