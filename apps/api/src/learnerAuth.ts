import { createHash } from 'crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import nodemailer from 'nodemailer';
import { config, corsOrigins } from './config.js';
import { prisma } from './db.js';
import { logger } from './logger.js';
import {
    learnerLoginSchema,
    learnerResetRequestSchema,
    learnerResetSchema,
    learnerSignupSchema,
} from './validation.js';

const ah =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

// ────────────────────────────────────────────────────────────────────────────
// Learner auth (LMS Phase 2): signup, login, /me, single-use password reset.
// Tokens are distinct from admin tokens (separate secret + role claim).
// No refresh rotation at scaffold level — 12h access token, same as console.
// ────────────────────────────────────────────────────────────────────────────

const learnerSecret = config.LEARNER_JWT_SECRET;
const learnerConfigured = Boolean(learnerSecret);

const publicWebUrl = config.PUBLIC_WEB_URL ?? corsOrigins[0] ?? 'http://localhost:3000';

/** Shared limiter for all credential endpoints (5/min/IP). */
const authLimiter = new RateLimiterMemory({ points: 5, duration: 60 });

// Compared against when the account doesn't exist so timing leaks nothing.
const DUMMY_HASH = '$2b$10$9kH0w8Vz0YlW3Z1QzQ0G0O6b8Jb0nqQ0ZQ0ZQ0ZQ0ZQ0ZQ0ZQ0ZQ0W';

export function signLearnerToken(userId: string): string {
    return jwt.sign({ sub: userId, role: 'learner' }, learnerSecret as string, { expiresIn: '12h' });
}

/** Fingerprint of the current password state — a reset token dies the moment
 *  the password changes, giving single-use tokens with no DB table. */
function resetFingerprint(user: { email: string; passwordHash: string | null }): string {
    const basis = user.passwordHash ?? `unset:${user.email}`;
    return createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

export function issueResetToken(user: { id: string; email: string; passwordHash: string | null }): string {
    return jwt.sign(
        { sub: user.id, kind: 'reset', fp: resetFingerprint(user) },
        learnerSecret as string,
        { expiresIn: '30m' },
    );
}

export function verifyResetToken(
    token: string,
    user: { id: string; email: string; passwordHash: string | null },
): boolean {
    try {
        const payload = jwt.verify(token, learnerSecret as string) as { sub?: string; kind?: string; fp?: string };
        return payload.kind === 'reset' && payload.sub === user.id && payload.fp === resetFingerprint(user);
    } catch {
        return false;
    }
}

export function requireLearner(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token || !learnerConfigured) {
        return res.status(401).json({ message: 'Sign in first' });
    }
    try {
        const payload = jwt.verify(token, learnerSecret as string) as { sub?: string; role?: string };
        if (payload.role !== 'learner' || !payload.sub) throw new Error('bad role');
        res.locals.learnerUserId = payload.sub;
        return next();
    } catch {
        return res.status(401).json({ message: 'Session expired — sign in again' });
    }
}

const transporter: nodemailer.Transporter | null =
    config.SMTP_HOST && config.SMTP_USER
        ? nodemailer.createTransport({
              host: config.SMTP_HOST,
              port: config.SMTP_PORT,
              secure: config.SMTP_SECURE === 'true',
              auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
          })
        : null;

async function consumeRate(req: Request, res: Response): Promise<boolean> {
    try {
        await authLimiter.consume(req.ip ?? 'unknown');
        return true;
    } catch {
        res.status(429).json({ message: 'Too many attempts. Try again shortly.' });
        return false;
    }
}

export const learnerRouter = Router();

function publicUser(u: { id: string; name: string; email: string; role: string }) {
    return { id: u.id, name: u.name, email: u.email, role: u.role };
}

// POST /signup — create a student account, or claim an admin-created one.
learnerRouter.post(
    '/signup',
    ah(async (req, res) => {
        if (!(await consumeRate(req, res))) return;
        if (!learnerConfigured) return res.status(503).json({ message: 'Learner accounts not enabled on this deployment' });
        const parsed = learnerSignupSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Check your details and try again' });
        const { name, password } = parsed.data;
        const email = parsed.data.email.toLowerCase();

        const existing = await prisma.lmsUser.findUnique({ where: { email } });
        if (existing?.passwordHash) {
            return res.status(409).json({ message: 'An account with this email already exists — sign in instead.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = existing
            ? await prisma.lmsUser.update({ where: { email }, data: { name, passwordHash } })
            : await prisma.lmsUser.create({ data: { name, email, role: 'student', passwordHash } });
        logger.info({ userId: user.id }, 'learner account created');
        return res.status(201).json({ token: signLearnerToken(user.id), user: publicUser(user) });
    }),
);

// POST /login
learnerRouter.post(
    '/login',
    ah(async (req, res) => {
        if (!(await consumeRate(req, res))) return;
        if (!learnerConfigured) return res.status(503).json({ message: 'Learner accounts not enabled on this deployment' });
        const parsed = learnerLoginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(401).json({ message: 'Invalid credentials' });
        const email = parsed.data.email.toLowerCase();

        const user = await prisma.lmsUser.findUnique({ where: { email } });
        const passwordOk = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !user.passwordHash || !passwordOk) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'This account is suspended — contact the school.' });
        }
        return res.json({ token: signLearnerToken(user.id), user: publicUser(user) });
    }),
);

// GET /me — profile + enrollments for the portal.
learnerRouter.get(
    '/me',
    requireLearner,
    ah(async (_req, res) => {
        const user = await prisma.lmsUser.findUnique({
            where: { id: res.locals.learnerUserId as string },
            include: {
                enrollments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        course: { select: { title: true, slug: true, track: true } },
                        tutor: { select: { name: true } },
                    },
                },
            },
        });
        if (!user) return res.status(401).json({ message: 'Account no longer exists' });
        if (user.status === 'suspended') return res.status(403).json({ message: 'This account is suspended — contact the school.' });
        return res.json({
            user: publicUser(user),
            enrollments: user.enrollments.map((e) => ({
                id: e.id,
                status: e.status,
                progress: e.progress,
                course: e.course,
                tutor: e.tutor?.name ?? null,
                updatedAt: e.updatedAt,
            })),
        });
    }),
);

// GET /courses/:slug/modules — enrolled learners only; published modules only.
learnerRouter.get(
    '/courses/:slug/modules',
    requireLearner,
    ah(async (req, res) => {
        const user = await prisma.lmsUser.findUnique({ where: { id: res.locals.learnerUserId as string } });
        if (!user) return res.status(401).json({ message: 'Account no longer exists' });
        if (user.status === 'suspended') return res.status(403).json({ message: 'This account is suspended — contact the school.' });

        const course = await prisma.course.findUnique({ where: { slug: req.params.slug } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const enrollment = await prisma.enrollment.findUnique({
            where: { studentId_courseId: { studentId: user.id, courseId: course.id } },
        });
        if (!enrollment) {
            return res.status(403).json({ message: 'You are not enrolled in this course yet — apply from the course page.' });
        }

        const modules = await prisma.courseModule.findMany({
            where: { courseId: course.id, published: true },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            select: { id: true, title: true, order: true, body: true },
        });
        return res.json({
            course: { title: course.title, slug: course.slug, track: course.track },
            enrollment: { id: enrollment.id, status: enrollment.status, progress: enrollment.progress },
            modules,
        });
    }),
);

// POST /forgot-password — always 200 so emails cannot be enumerated.
learnerRouter.post(
    '/forgot-password',
    ah(async (req, res) => {
        if (!(await consumeRate(req, res))) return;
        const parsed = learnerResetRequestSchema.safeParse(req.body);
        if (!parsed.success) return res.json({ ok: true });
        if (!learnerConfigured) return res.json({ ok: true });
        const email = parsed.data.email.toLowerCase();

        const user = await prisma.lmsUser.findUnique({ where: { email } });
        if (user && user.status !== 'suspended') {
            const token = issueResetToken(user);
            const link = `${publicWebUrl}/sign-in?reset=${token}`;
            if (transporter) {
                try {
                    await transporter.sendMail({
                        from: config.SMTP_FROM,
                        to: email,
                        subject: 'Reset your learner password',
                        text: `Hi ${user.name},\n\nReset your password (link expires in 30 minutes):\n${link}\n\nIf you did not ask for this, ignore this email — your password stays the same.\n\nYkay Consulting Hub`,
                    });
                } catch (err) {
                    logger.warn({ err }, 'learner reset email failed');
                }
            } else {
                logger.info({ email, link }, 'learner reset link (no SMTP configured)');
            }
        }
        return res.json({ ok: true, message: 'If an account exists for that email, a reset link is on its way.' });
    }),
);

// POST /reset-password — single-use token + new password.
learnerRouter.post(
    '/reset-password',
    ah(async (req, res) => {
        if (!(await consumeRate(req, res))) return;
        if (!learnerConfigured) return res.status(503).json({ message: 'Learner accounts not enabled on this deployment' });
        const parsed = learnerResetSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

        // Verify signature/expiry first, then load the user the token names.
        let sub: string | null = null;
        try {
            const payload = jwt.verify(parsed.data.token, learnerSecret as string) as { sub?: string; kind?: string };
            if (payload.kind === 'reset' && payload.sub) sub = payload.sub;
        } catch {
            /* falls through to invalid-token 400 */
        }
        const user = sub ? await prisma.lmsUser.findUnique({ where: { id: sub } }) : null;
        if (!user || !verifyResetToken(parsed.data.token, user)) {
            return res.status(400).json({ message: 'Reset link is invalid or expired — request a new one.' });
        }
        await prisma.lmsUser.update({
            where: { id: user.id },
            data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
        });
        logger.info({ userId: user.id }, 'learner password reset');
        return res.json({ ok: true, message: 'Password updated — sign in with your new password.' });
    }),
);
