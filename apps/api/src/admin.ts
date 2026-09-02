import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from './config.js';
import { prisma } from './db.js';
import { logger } from './logger.js';
import {
    adminLoginSchema,
    courseUpsertSchema,
    enquiryUpdateSchema,
    eventUpsertSchema,
    listQuerySchema,
    postUpsertSchema,
} from './validation.js';

/** Wrap async route handlers so rejections reach the error middleware. */
const ah =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

// ────────────────────────────────────────────────────────────────────────────
// Solo-admin auth: env-configured credentials, bcrypt at boot, JWT sessions
// ────────────────────────────────────────────────────────────────────────────

const adminConfigured = Boolean(config.ADMIN_EMAIL && config.ADMIN_PASSWORD && config.ADMIN_JWT_SECRET);
// Hash once at module load — never store or compare the plaintext again.
const passwordHash = adminConfigured ? bcrypt.hashSync(config.ADMIN_PASSWORD as string, 10) : null;

/** Tighter limiter for the login route only (5 attempts / minute / IP). */
const loginLimiter = new RateLimiterMemory({ points: 5, duration: 60 });

export function signAdminToken(email: string): string {
    return jwt.sign({ sub: email, role: 'admin' }, config.ADMIN_JWT_SECRET as string, { expiresIn: '12h' });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token || !adminConfigured) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const payload = jwt.verify(token, config.ADMIN_JWT_SECRET as string) as { role?: string };
        if (payload.role !== 'admin') throw new Error('bad role');
        return next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

export const adminRouter = Router();

adminRouter.post(
    '/login',
    ah(async (req, res) => {
        try {
            await loginLimiter.consume(req.ip ?? 'unknown');
        } catch {
            return res.status(429).json({ message: 'Too many attempts. Try again shortly.' });
        }
        if (!adminConfigured || !passwordHash) {
            return res.status(503).json({ message: 'Admin console is not configured on this deployment' });
        }
        const parsed = adminLoginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(401).json({ message: 'Invalid credentials' });
        const { email, password } = parsed.data;
        // Compare against a valid-looking hash even when the email is wrong,
        // so timing does not reveal whether the account exists.
        const emailOk = email.toLowerCase() === (config.ADMIN_EMAIL as string).toLowerCase();
        const passwordOk = await bcrypt.compare(password, passwordHash);
        if (!emailOk || !passwordOk) {
            logger.warn({ ip: req.ip }, 'admin login failed');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        return res.json({ token: signAdminToken(email.toLowerCase()), expiresIn: 43_200 });
    }),
);

adminRouter.use(requireAdmin);

// ────────────────────────────────────────────────────────────────────────────
// Dashboard overview
// ────────────────────────────────────────────────────────────────────────────

adminRouter.get(
    '/overview',
    ah(async (_req, res) => {
        const [enquiriesByStatus, courses, events, posts] = await Promise.all([
            prisma.contactEnquiry.groupBy({ by: ['status'], _count: true }),
            prisma.course.count(),
            prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
            prisma.post.count({ where: { published: true } }),
        ]);
        res.json({
            enquiries: Object.fromEntries(enquiriesByStatus.map((g) => [g.status, g._count])),
            courses,
            upcomingEvents: events,
            publishedPosts: posts,
        });
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// CRM: contact enquiries
// ────────────────────────────────────────────────────────────────────────────

adminRouter.get(
    '/enquiries',
    ah(async (req, res) => {
        const q = listQuerySchema.safeParse(req.query);
        const { limit, offset, status } = q.success ? q.data : { limit: 50, offset: 0, status: undefined };
        const [items, total] = await Promise.all([
            prisma.contactEnquiry.findMany({
                where: status ? { status } : {},
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.contactEnquiry.count({ where: status ? { status } : {} }),
        ]);
        res.json({ items, total });
    }),
);

adminRouter.patch(
    '/enquiries/:id',
    ah(async (req, res) => {
        const parsed = enquiryUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        try {
            const enquiry = await prisma.contactEnquiry.update({ where: { id: req.params.id }, data: parsed.data });
            return res.json(enquiry);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Enquiry not found' });
            }
            throw err;
        }
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Generic CRUD factory for Course / Event / Post (uniform behavior)
// ────────────────────────────────────────────────────────────────────────────

type Delegate = {
    findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
    count: (args?: Record<string, unknown>) => Promise<number>;
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
};

function crudRoutes(path: string, delegate: Delegate, schema: z.ZodObject<z.ZodRawShape>, orderBy: Record<string, 'asc' | 'desc'>) {
    adminRouter.get(
        `/${path}`,
        ah(async (req, res) => {
            const q = listQuerySchema.safeParse(req.query);
            const { limit, offset } = q.success ? q.data : { limit: 50, offset: 0 };
            const [items, total] = await Promise.all([
                delegate.findMany({ orderBy, take: limit, skip: offset }),
                delegate.count(),
            ]);
            res.json({ items, total });
        }),
    );

    adminRouter.post(
        `/${path}`,
        ah(async (req, res) => {
            const parsed = schema.safeParse(req.body);
            if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
            try {
                const item = await delegate.create({ data: parsed.data as Record<string, unknown> });
                return res.status(201).json(item);
            } catch (err) {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                    return res.status(409).json({ message: 'Slug already in use' });
                }
                throw err;
            }
        }),
    );

    adminRouter.patch(
        `/${path}/:id`,
        ah(async (req, res) => {
            const parsed = schema.partial().safeParse(req.body);
            if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
            try {
                const item = await delegate.update({ where: { id: req.params.id }, data: parsed.data as Record<string, unknown> });
                return res.json(item);
            } catch (err) {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                    return res.status(404).json({ message: 'Not found' });
                }
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                    return res.status(409).json({ message: 'Slug already in use' });
                }
                throw err;
            }
        }),
    );

    adminRouter.delete(
        `/${path}/:id`,
        ah(async (req, res) => {
            try {
                await delegate.delete({ where: { id: req.params.id } });
                return res.status(204).send();
            } catch (err) {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                    return res.status(404).json({ message: 'Not found' });
                }
                throw err;
            }
        }),
    );
}

crudRoutes('courses', prisma.course as unknown as Delegate, courseUpsertSchema, { sortOrder: 'asc' });
crudRoutes('events', prisma.event as unknown as Delegate, eventUpsertSchema, { startsAt: 'desc' });
crudRoutes('posts', prisma.post as unknown as Delegate, postUpsertSchema, { publishedAt: 'desc' });
