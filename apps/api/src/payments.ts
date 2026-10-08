import { createHmac, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router, raw } from 'express';
import { z } from 'zod';
import { config, corsOrigins } from './config.js';
import { prisma } from './db.js';
import { logger } from './logger.js';
import { rateLimitPaymentInit, rateLimitPaymentVerify } from './rateLimit.js';

const ah =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

// ────────────────────────────────────────────────────────────────────────────
// Payments (LMS Phase 5): Paystack initialize → hosted checkout → verify.
// Entire module is dormant (clean 503) until PAYSTACK_SECRET_KEY is set.
// No SDK needed: initialize returns an authorization_url we redirect to.
// ────────────────────────────────────────────────────────────────────────────

const paystackSecret = config.PAYSTACK_SECRET_KEY;
const paymentsConfigured = Boolean(paystackSecret);
const publicWebUrl = config.PUBLIC_WEB_URL ?? corsOrigins[0] ?? 'http://localhost:3000';

const initializeSchema = z.object({
    courseSlug: z.string().min(1),
    email: z.string().trim().email().max(320),
    name: z.string().trim().min(2).max(80).optional(),
});

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`https://api.paystack.co${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
    const body = (await res.json().catch(() => null)) as { status?: boolean; message?: string } & T;
    if (!res.ok || body.status === false) {
        throw new Error(body.message ?? `Paystack error (${res.status})`);
    }
    return body;
}

/**
 * The slice of the Prisma client this module uses. Declared structurally so the
 * same helpers work with `prisma` and with an interactive transaction client.
 */
type Tx = Pick<typeof prisma, 'lmsUser' | 'enrollment' | 'purchase'>;

type PurchaseLike = { email: string; name: string | null; courseId: string | null; courseSlug: string };

/**
 * After a successful payment: upsert the learner (by email) and enroll them.
 *
 * Idempotent, and safe inside a transaction (audit P0-7). It used to catch
 * P2002 from a bare create — which is fine standalone but fatal inside a
 * transaction, where a failed statement aborts the whole thing in Postgres.
 * The compound unique @@unique([studentId, courseId]) lets us upsert instead,
 * so there is no error to swallow.
 *
 * Returns true when it actually created the enrolment.
 */
async function ensureEnrollment(tx: Tx, purchase: PurchaseLike): Promise<boolean> {
    if (!purchase.courseId) return false;
    const email = purchase.email.toLowerCase();
    const user = await tx.lmsUser.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: purchase.name?.trim() || email.split('@')[0],
            role: 'student',
        },
    });
    const key = { studentId_courseId: { studentId: user.id, courseId: purchase.courseId } };
    const existing = await tx.enrollment.findUnique({ where: key });
    if (existing) return false;
    await tx.enrollment.upsert({
        where: key,
        update: {},
        create: { studentId: user.id, courseId: purchase.courseId, status: 'active', progress: 0 },
    });
    return true;
}

/**
 * Mark a purchase paid AND grant access as one unit.
 *
 * Previously these were two independent awaits: a crash, a dropped connection
 * or a failing enrolment between them left a row saying "paid" with no
 * enrolment attached — and /verify's already-success short-circuit meant the
 * learner could never recover it by retrying. Both writes now commit together.
 */
async function settlePurchase(purchaseId: string, purchase: PurchaseLike): Promise<boolean> {
    return prisma.$transaction(async (tx: Tx) => {
        await tx.purchase.update({ where: { id: purchaseId }, data: { status: 'success', paidAt: new Date() } });
        const granted = await ensureEnrollment(tx, purchase);
        return granted;
    });
}

/**
 * How long a started-but-never-completed checkout stays "pending" (audit P1-11).
 *
 * `initialize` writes a purchase row BEFORE Paystack answers and nothing ever
 * cleaned those rows up, so every abandoned checkout — and every reload of the
 * pay page — left a row behind permanently. Paystack itself abandons an
 * unpaid transaction well inside a day.
 */
export const PENDING_PURCHASE_TTL_MS = 24 * 60 * 60 * 1000;

/** Don't sweep on every request; once an hour per instance is plenty. */
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;
let lastSweepAt = 0;

/**
 * Flip long-abandoned pending purchases to `expired`.
 *
 * Deliberately a status change rather than a delete: a row is the only record
 * that a learner tried to pay, which is worth keeping for support. Nothing
 * reads `expired`, and `verify` is unaffected — it re-checks Paystack by
 * reference regardless of the local status, so a genuinely-paid purchase that
 * got swept still settles correctly.
 */
export async function expireStalePendingPurchases(now = Date.now()): Promise<number> {
    const { count } = await prisma.purchase.updateMany({
        where: { status: 'pending', createdAt: { lt: new Date(now - PENDING_PURCHASE_TTL_MS) } },
        data: { status: 'expired' },
    });
    if (count > 0) logger.info({ count }, 'expired stale pending purchases');
    return count;
}

/** Run the sweep at most once per SWEEP_INTERVAL_MS, never blocking the request. */
function maybeSweep(now = Date.now()): void {
    if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
    lastSweepAt = now;
    void expireStalePendingPurchases(now).catch((err: unknown) =>
        logger.warn({ err }, 'pending-purchase sweep failed'),
    );
}

/**
 * One live pending purchase per learner per course.
 *
 * Reloading the pay page used to mint a brand-new reference and a brand-new
 * row each time, so a hesitant buyer could leave dozens behind. Superseding
 * the previous attempt keeps the table proportional to real intent while
 * leaving the old reference resolvable if Paystack reports it paid later.
 */
async function supersedePendingPurchases(email: string, courseId: string): Promise<number> {
    const { count } = await prisma.purchase.updateMany({
        where: { email, courseId, status: 'pending' },
        data: { status: 'superseded' },
    });
    return count;
}

export const paymentsRouter = Router();

// POST /api/v1/payments/initialize — create a pending purchase, return Paystack URL.
paymentsRouter.post(
    '/initialize',
    rateLimitPaymentInit,
    ah(async (req, res) => {
        if (!paymentsConfigured) {
            return res.status(503).json({ message: 'Online payment is not enabled yet — apply instead and we will share payment details.' });
        }
        const parsed = initializeSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Check your details and try again' });
        const { courseSlug, name } = parsed.data;
        const email = parsed.data.email.toLowerCase();

        const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
        if (!course || !course.published) return res.status(404).json({ message: 'Course not found' });
        if (!course.priceKobo || course.priceKobo <= 0) {
            return res.status(409).json({ message: 'This course is application-based — please use the apply form instead.' });
        }

        maybeSweep();
        const superseded = await supersedePendingPurchases(email, course.id);
        if (superseded > 0) {
            logger.info({ email, courseSlug, superseded }, 'superseded earlier pending purchases');
        }

        const reference = `ykh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        await prisma.purchase.create({
            data: {
                reference,
                email,
                name: name ?? null,
                courseSlug,
                courseId: course.id,
                amountKobo: course.priceKobo,
                currency: course.currency,
            },
        });

        const ps = await paystack<{ data: { authorization_url: string; reference: string } }>('/transaction/initialize', {
            method: 'POST',
            body: JSON.stringify({
                email,
                amount: course.priceKobo,
                currency: course.currency,
                reference,
                callback_url: `${publicWebUrl}/pay/callback?reference=${encodeURIComponent(reference)}`,
                metadata: { courseSlug, product: 'course' },
            }),
        });

        return res.status(201).json({ authorizationUrl: ps.data.authorization_url, reference });
    }),
);

// GET /api/v1/payments/verify/:reference — landing-page verification after redirect.
paymentsRouter.get(
    '/verify/:reference',
    rateLimitPaymentVerify,
    ah(async (req, res) => {
        if (!paymentsConfigured) return res.status(503).json({ message: 'Payments not enabled' });
        const purchase = await prisma.purchase.findUnique({ where: { reference: req.params.reference } });
        if (!purchase) return res.status(404).json({ message: 'Unknown reference' });
        if (purchase.status === 'success') {
            // Do NOT just report success: a purchase settled by the old
            // non-transactional path (or interrupted between its two writes)
            // can be paid with no enrolment, and this branch was the only one a
            // learner could reach by retrying — so the state was unrecoverable.
            // Re-granting is idempotent, so repairing here costs nothing.
            const repaired = await prisma.$transaction((tx: Tx) => ensureEnrollment(tx, purchase));
            if (repaired) {
                logger.warn(
                    { reference: purchase.reference, courseSlug: purchase.courseSlug },
                    'paid purchase had no enrollment — re-granted on verify',
                );
            }
            return res.json({ status: 'success', courseSlug: purchase.courseSlug, already: true, repaired });
        }

        const ps = await paystack<{ data: { status: string; reference: string; amount: number } }>(
            `/transaction/verify/${encodeURIComponent(req.params.reference)}`,
        );
        const paid = ps.data.status === 'success' && ps.data.amount === purchase.amountKobo;
        if (!paid) {
            if (purchase.status !== 'failed') {
                await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'failed' } });
            }
            return res.json({ status: 'failed', courseSlug: purchase.courseSlug });
        }

        const granted = await settlePurchase(purchase.id, purchase);
        logger.info(
            { reference: purchase.reference, courseSlug: purchase.courseSlug, granted },
            granted ? 'enrollment granted from payment' : 'payment re-confirmed existing enrollment',
        );
        return res.json({ status: 'success', courseSlug: purchase.courseSlug });
    }),
);

/**
 * Does `header` carry Paystack's HMAC-SHA512 of the raw request body?
 *
 * Compared in constant time. `!==` returns at the first differing byte, so how
 * long the comparison takes depends on how much of a forged signature matched
 * (audit: webhook HMAC uses `!==`).
 */
export function isValidPaystackSignature(header: unknown, body: Buffer, secret: string): boolean {
    if (typeof header !== 'string') return false;
    const expected = createHmac('sha512', secret).update(body).digest();
    const given = Buffer.from(header, 'hex');
    // timingSafeEqual throws on unequal lengths, so compare lengths first.
    return given.length === expected.length && timingSafeEqual(given, expected);
}

// POST /api/v1/payments/webhook — raw body + HMAC signature (mounted BEFORE json parser).
export function paymentsWebhook(): RequestHandler {
    return ah(async (req, res) => {
        if (!paymentsConfigured) return res.status(503).json({ message: 'Payments not enabled' });
        const signature = req.headers['x-paystack-signature'];
        if (!isValidPaystackSignature(signature, req.body as Buffer, paystackSecret as string)) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        let event: { event?: string; data?: { reference?: string; status?: string; amount?: number } };
        try {
            event = JSON.parse((req.body as Buffer).toString('utf8'));
        } catch {
            return res.status(400).json({ message: 'Malformed payload' });
        }

        if (event.event === 'charge.success' && event.data?.reference) {
            const purchase = await prisma.purchase.findUnique({ where: { reference: event.data.reference } });
            if (purchase && event.data.amount === purchase.amountKobo) {
                if (purchase.status !== 'success') {
                    // Same transactional settle as /verify — whichever of the
                    // two arrives first wins and the other becomes a no-op.
                    const granted = await settlePurchase(purchase.id, purchase);
                    logger.info({ reference: purchase.reference, granted }, 'purchase settled from webhook');
                } else {
                    // Already marked paid: still make sure access exists.
                    const repaired = await prisma.$transaction((tx: Tx) => ensureEnrollment(tx, purchase));
                    if (repaired) {
                        logger.warn({ reference: purchase.reference }, 'paid purchase had no enrollment — re-granted from webhook');
                    }
                }
            }
        }
        return res.sendStatus(200);
    });
}

export const paymentsRawBody = raw({ type: 'application/json' });
