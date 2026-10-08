import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createHmac } from 'crypto';

/**
 * Audit finding P0-7: a learner could pay and never be enrolled, with no way
 * back.
 *
 *   · /verify short-circuited on `status === 'success'` and returned
 *     `{ already: true }` WITHOUT checking that an enrolment existed, so
 *     retrying — the only thing a stuck learner can do — could never fix it;
 *   · the "mark paid" write and the enrolment grant were two independent
 *     awaits, so any failure between them produced exactly that state.
 */

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_fake';
process.env.CORS_ORIGIN = 'http://localhost:3000';

type Enrollment = { studentId: string; courseId: string; status: string; progress: number };

const db = vi.hoisted(() => ({
    purchases: [] as Record<string, unknown>[],
    courses: [] as Record<string, unknown>[],
    users: [] as { id: string; email: string; name: string; role: string }[],
    enrollments: [] as Enrollment[],
    transactions: 0,
    seq: 0,
}));

const prismaMock = vi.hoisted(() => {
    const client: Record<string, unknown> = {};
    return client;
});

vi.mock('./db.js', () => ({ prisma: prismaMock }));
vi.mock('./logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

Object.assign(prismaMock, {
    purchase: {
        findUnique: async ({ where }: { where: { reference?: string; id?: string } }) =>
            db.purchases.find((p) => p.reference === where.reference || p.id === where.id) ?? null,
        update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
            const row = db.purchases.find((p) => p.id === where.id);
            Object.assign(row!, data);
            return row;
        },
        create: async ({ data }: { data: Record<string, unknown> }) => {
            // `status` and `createdAt` come from schema defaults in Postgres.
            const row = { id: `p${++db.seq}`, status: 'pending', createdAt: new Date(), ...data };
            db.purchases.push(row);
            return row;
        },
        updateMany: async ({
            where,
            data,
        }: {
            where: { status?: string; email?: string; courseId?: string; createdAt?: { lt: Date } };
            data: Record<string, unknown>;
        }) => {
            const hit = db.purchases.filter(
                (p) =>
                    (where.status === undefined || p.status === where.status) &&
                    (where.email === undefined || p.email === where.email) &&
                    (where.courseId === undefined || p.courseId === where.courseId) &&
                    (where.createdAt === undefined || (p.createdAt as Date) < where.createdAt.lt),
            );
            hit.forEach((p) => Object.assign(p, data));
            return { count: hit.length };
        },
    },
    course: {
        findUnique: async ({ where }: { where: { slug: string } }) =>
            db.courses.find((c) => c.slug === where.slug) ?? null,
    },
    lmsUser: {
        upsert: async ({ where, create }: { where: { email: string }; create: { email: string; name: string; role: string } }) => {
            const found = db.users.find((u) => u.email === where.email);
            if (found) return found;
            const user = { id: `u${++db.seq}`, ...create };
            db.users.push(user);
            return user;
        },
    },
    enrollment: {
        findUnique: async ({ where }: { where: { studentId_courseId: { studentId: string; courseId: string } } }) => {
            const { studentId, courseId } = where.studentId_courseId;
            return db.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId) ?? null;
        },
        upsert: async ({
            where,
            create,
        }: {
            where: { studentId_courseId: { studentId: string; courseId: string } };
            create: Enrollment;
        }) => {
            const { studentId, courseId } = where.studentId_courseId;
            const found = db.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
            if (found) return found;
            db.enrollments.push(create);
            return create;
        },
    },
    $transaction: async <R>(fn: (tx: unknown) => Promise<R>): Promise<R> => {
        db.transactions += 1;
        return fn(prismaMock);
    },
});

type Payments = typeof import('./payments.js');
let payments: Payments;

beforeAll(async () => {
    payments = await import('./payments.js');
});

beforeEach(() => {
    db.purchases = [];
    db.courses = [];
    db.users = [];
    db.enrollments = [];
    db.transactions = 0;
    db.seq = 0;
});

/** Pull a concrete handler out of the Express router so it can be driven directly. */
function handlerFor(method: 'get' | 'post', path: string) {
    const stack = (payments.paymentsRouter as unknown as { stack: RouteLayer[] }).stack;
    const layer = stack.find((l) => l.route?.path === path && l.route.methods[method]);
    if (!layer) throw new Error(`no ${method} ${path} route`);
    const handlers = layer.route!.stack;
    return handlers[handlers.length - 1]!.handle;
}

interface RouteLayer {
    route?: {
        path: string;
        methods: Record<string, boolean>;
        stack: { handle: (req: Request, res: Response, next: (e?: unknown) => void) => void }[];
    };
}

/** Run a handler and resolve with whatever it answered. */
function invoke(
    handler: (req: Request, res: Response, next: (e?: unknown) => void) => void,
    req: Partial<Request>,
): Promise<{ status: number; body: unknown }> {
    return new Promise((resolve, reject) => {
        const res = {
            statusCode: 200,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            json(body: unknown) {
                resolve({ status: this.statusCode, body });
                return this;
            },
            send() {
                resolve({ status: this.statusCode, body: undefined });
                return this;
            },
            sendStatus(code: number) {
                this.statusCode = code;
                resolve({ status: code, body: undefined });
                return this;
            },
        };
        handler(req as Request, res as unknown as Response, (err) => reject(err ?? new Error('next() called')));
    });
}

function seedPaidPurchase(overrides: Record<string, unknown> = {}) {
    const purchase = {
        id: 'p1',
        reference: 'ykh-abc-123',
        email: 'Ada@Example.com',
        name: 'Ada Lovelace',
        courseSlug: 'iso-iec-27001-foundation',
        courseId: 'course-1',
        amountKobo: 250_000,
        currency: 'NGN',
        status: 'success',
        paidAt: new Date(),
        ...overrides,
    };
    db.purchases.push(purchase);
    return purchase;
}

describe('GET /payments/verify/:reference — already-success branch', () => {
    it('re-grants the enrolment for a paid purchase that never got one', async () => {
        seedPaidPurchase();
        expect(db.enrollments).toHaveLength(0);

        const result = await invoke(handlerFor('get', '/verify/:reference'), {
            params: { reference: 'ykh-abc-123' },
        });

        expect(result.body).toMatchObject({ status: 'success', already: true, repaired: true });
        expect(db.enrollments).toEqual([
            { studentId: 'u1', courseId: 'course-1', status: 'active', progress: 0 },
        ]);
    });

    it('creates the learner account by lowercased email when repairing', async () => {
        seedPaidPurchase();
        await invoke(handlerFor('get', '/verify/:reference'), { params: { reference: 'ykh-abc-123' } });
        expect(db.users[0]).toMatchObject({ email: 'ada@example.com', name: 'Ada Lovelace', role: 'student' });
    });

    it('is idempotent — a second verify does not duplicate the enrolment', async () => {
        seedPaidPurchase();
        const handler = handlerFor('get', '/verify/:reference');

        await invoke(handler, { params: { reference: 'ykh-abc-123' } });
        const second = await invoke(handler, { params: { reference: 'ykh-abc-123' } });

        expect(second.body).toMatchObject({ already: true, repaired: false });
        expect(db.enrollments).toHaveLength(1);
    });

    it('reports repaired:false when the enrolment was already in place', async () => {
        seedPaidPurchase();
        db.users.push({ id: 'u1', email: 'ada@example.com', name: 'Ada', role: 'student' });
        db.enrollments.push({ studentId: 'u1', courseId: 'course-1', status: 'active', progress: 0 });

        const result = await invoke(handlerFor('get', '/verify/:reference'), {
            params: { reference: 'ykh-abc-123' },
        });

        expect(result.body).toMatchObject({ already: true, repaired: false });
        expect(db.enrollments).toHaveLength(1);
    });

    it('does the repair inside a transaction', async () => {
        seedPaidPurchase();
        await invoke(handlerFor('get', '/verify/:reference'), { params: { reference: 'ykh-abc-123' } });
        expect(db.transactions).toBe(1);
    });

    it('still 404s an unknown reference', async () => {
        const result = await invoke(handlerFor('get', '/verify/:reference'), {
            params: { reference: 'nope' },
        });
        expect(result.status).toBe(404);
    });

    it('does not try to enroll an application-only purchase with no courseId', async () => {
        seedPaidPurchase({ courseId: null });

        const result = await invoke(handlerFor('get', '/verify/:reference'), {
            params: { reference: 'ykh-abc-123' },
        });

        expect(result.body).toMatchObject({ already: true, repaired: false });
        expect(db.enrollments).toHaveLength(0);
    });
});

/**
 * Audit finding P1-11: `/payments/initialize` writes a purchase row BEFORE
 * Paystack answers, and nothing ever cleaned those rows up — so every
 * abandoned checkout and every reload of the pay page left a pending row
 * behind forever.
 */
describe('pending purchase hygiene', () => {
    const DAY = 24 * 60 * 60 * 1000;

    function pending(overrides: Record<string, unknown> = {}) {
        const row = {
            id: `p${++db.seq}`,
            reference: `ykh-${db.seq}`,
            email: 'ada@example.com',
            name: 'Ada',
            courseSlug: 'iso-27001',
            courseId: 'course-1',
            amountKobo: 45_000_000,
            currency: 'NGN',
            status: 'pending',
            createdAt: new Date(),
            ...overrides,
        };
        db.purchases.push(row);
        return row;
    }

    it('expires pending rows older than the TTL', async () => {
        const now = Date.now();
        pending({ createdAt: new Date(now - 2 * DAY) });
        pending({ createdAt: new Date(now - 30 * 60 * 1000) });

        const count = await payments.expireStalePendingPurchases(now);

        expect(count).toBe(1);
        expect(db.purchases.map((p) => p.status)).toEqual(['expired', 'pending']);
    });

    it('leaves settled purchases alone no matter how old', async () => {
        const now = Date.now();
        pending({ status: 'success', createdAt: new Date(now - 400 * DAY) });
        pending({ status: 'failed', createdAt: new Date(now - 400 * DAY) });

        expect(await payments.expireStalePendingPurchases(now)).toBe(0);
        expect(db.purchases.map((p) => p.status)).toEqual(['success', 'failed']);
    });

    it('uses a 24-hour TTL', () => {
        expect(payments.PENDING_PURCHASE_TTL_MS).toBe(DAY);
    });

    it('supersedes the previous pending attempt instead of piling rows up', async () => {
        db.courses.push({
            id: 'course-1',
            slug: 'iso-27001',
            published: true,
            priceKobo: 45_000_000,
            currency: 'NGN',
        });
        pending();
        pending();

        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: true,
                json: async () => ({
                    status: true,
                    data: { authorization_url: 'https://checkout.paystack.com/x', reference: 'ykh-new' },
                }),
            })),
        );

        const result = await invoke(handlerFor('post', '/initialize'), {
            body: { courseSlug: 'iso-27001', email: 'Ada@Example.com', name: 'Ada' },
        });

        expect(result.status).toBe(201);
        // the two earlier attempts are closed out, exactly one is live
        expect(db.purchases.filter((p) => p.status === 'pending')).toHaveLength(1);
        expect(db.purchases.filter((p) => p.status === 'superseded')).toHaveLength(2);
        vi.unstubAllGlobals();
    });

    it('does not supersede another learner\u2019s pending purchase', async () => {
        db.courses.push({
            id: 'course-1',
            slug: 'iso-27001',
            published: true,
            priceKobo: 45_000_000,
            currency: 'NGN',
        });
        pending({ email: 'grace@example.com' });

        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: true,
                json: async () => ({
                    status: true,
                    data: { authorization_url: 'https://checkout.paystack.com/x', reference: 'ykh-new' },
                }),
            })),
        );

        await invoke(handlerFor('post', '/initialize'), {
            body: { courseSlug: 'iso-27001', email: 'ada@example.com' },
        });

        expect(db.purchases.find((p) => p.email === 'grace@example.com')!.status).toBe('pending');
        vi.unstubAllGlobals();
    });
});

describe('POST /payments/webhook — signature check', () => {
    // Paystack signs the raw body with HMAC-SHA512 (hex) in x-paystack-signature.
    const body = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'ykh-unknown' } }));
    const sign = (payload: Buffer, key = 'sk_test_fake') => createHmac('sha512', key).update(payload).digest('hex');

    it('acknowledges a body signed with the Paystack secret', async () => {
        const res = await invoke(payments.paymentsWebhook(), { headers: { 'x-paystack-signature': sign(body) }, body });
        expect(res.status).toBe(200);
    });

    it('rejects a request with no signature', async () => {
        const res = await invoke(payments.paymentsWebhook(), { headers: {}, body });
        expect(res.status).toBe(401);
    });

    it('rejects a signature made with another key', async () => {
        const res = await invoke(payments.paymentsWebhook(), { headers: { 'x-paystack-signature': sign(body, 'other') }, body });
        expect(res.status).toBe(401);
    });

    it('rejects a body that changed after it was signed', async () => {
        const tampered = Buffer.from(body.toString().replace('ykh-unknown', 'ykh-other'));
        const res = await invoke(payments.paymentsWebhook(), { headers: { 'x-paystack-signature': sign(body) }, body: tampered });
        expect(res.status).toBe(401);
    });

    it('rejects a truncated signature with a 401, not a crash in timingSafeEqual', async () => {
        const res = await invoke(payments.paymentsWebhook(), { headers: { 'x-paystack-signature': sign(body).slice(0, 40) }, body });
        expect(res.status).toBe(401);
    });

    it('rejects a non-hex signature', async () => {
        const res = await invoke(payments.paymentsWebhook(), { headers: { 'x-paystack-signature': 'z'.repeat(128) }, body });
        expect(res.status).toBe(401);
    });

    it('accepts the signature in either hex case, since it is the same MAC', () => {
        expect(payments.isValidPaystackSignature(sign(body).toUpperCase(), body, 'sk_test_fake')).toBe(true);
        expect(payments.isValidPaystackSignature(sign(body), body, 'sk_test_fake')).toBe(true);
    });
});
