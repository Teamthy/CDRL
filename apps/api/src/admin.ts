import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from './config.js';
import { signScopedToken, verifyScopedToken } from './rbac.js';
import { prisma } from './db.js';
import { logger } from './logger.js';
import {
    adminLoginSchema,
    applicationUpdateSchema,
    courseModuleUpsertSchema,
    courseModuleUpdateSchema,
    enrollmentUpdateSchema,
    enrollmentUpsertSchema,
    lmsUserUpdateSchema,
    lmsUserUpsertSchema,
    recordingUpsertSchema,
    recordingUpdateSchema,
    bundleUpsertSchema,
    courseTrainerUpsertSchema,
    courseUpsertSchema,
    enquiryUpdateSchema,
    trainerUpsertSchema,
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
    return signScopedToken('admin', email);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = token ? verifyScopedToken('admin', token) : null;
    if (!payload || payload.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return next();
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

// patch-33: trainers, course<>trainer links, bundles (with course-membership sync)
crudRoutes('trainers', prisma.trainer as unknown as Delegate, trainerUpsertSchema, { sortOrder: 'asc' });
crudRoutes('course-trainers', prisma.courseTrainer as unknown as Delegate, courseTrainerUpsertSchema, { id: 'asc' });

adminRouter.post(
    '/bundles',
    ah(async (req, res) => {
        const parsed = bundleUpsertSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const { courseIds, ...data } = parsed.data;
        try {
            const bundle = await prisma.bundle.create({ data });
            if (courseIds.length) {
                await prisma.bundleCourse.createMany({
                    data: courseIds.map((courseId, i) => ({ bundleId: bundle.id, courseId, order: i })),
                });
            }
            const full = await prisma.bundle.findUnique({ where: { id: bundle.id }, include: { courses: { include: { course: true } } } });
            return res.status(201).json(full);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return res.status(409).json({ message: 'Slug already in use' });
            throw err;
        }
    }),
);

adminRouter.patch(
    '/bundles/:id',
    ah(async (req, res) => {
        const parsed = bundleUpsertSchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const { courseIds, ...data } = parsed.data;
        try {
            await prisma.bundle.update({ where: { id: req.params.id }, data: data as Record<string, unknown> });
            if (courseIds !== undefined) {
                await prisma.$transaction([
                    prisma.bundleCourse.deleteMany({ where: { bundleId: req.params.id } }),
                    prisma.bundleCourse.createMany({ data: courseIds.map((courseId, i) => ({ bundleId: req.params.id as string, courseId, order: i })) }),
                ]);
            }
            const full = await prisma.bundle.findUnique({ where: { id: req.params.id }, include: { courses: { include: { course: true } } } });
            return res.json(full);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return res.status(404).json({ message: 'Not found' });
            throw err;
        }
    }),
);

adminRouter.get(
    '/bundles',
    ah(async (req, res) => {
        const q = listQuerySchema.safeParse(req.query);
        const { limit, offset } = q.success ? q.data : { limit: 50, offset: 0 };
        const [items, total] = await Promise.all([
            prisma.bundle.findMany({ orderBy: { sortOrder: 'asc' }, take: limit, skip: offset, include: { courses: { include: { course: true } } } }),
            prisma.bundle.count(),
        ]);
        res.json({ items, total });
    }),
);

adminRouter.delete(
    '/bundles/:id',
    ah(async (req, res) => {
        await prisma.bundle.delete({ where: { id: req.params.id } });
        res.status(204).end();
    }),
);
crudRoutes('events', prisma.event as unknown as Delegate, eventUpsertSchema, { startsAt: 'desc' });
crudRoutes('posts', prisma.post as unknown as Delegate, postUpsertSchema, { publishedAt: 'desc' });

// ────────────────────────────────────────────────────────────────────────────
// Applications (training intake)
// ────────────────────────────────────────────────────────────────────────────

adminRouter.get(
    '/applications',
    ah(async (req, res) => {
        const q = listQuerySchema.safeParse(req.query);
        const { limit, offset, status } = q.success ? q.data : { limit: 50, offset: 0, status: undefined };
        const [items, total] = await Promise.all([
            prisma.application.findMany({
                where: status ? { status } : {},
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.application.count({ where: status ? { status } : {} }),
        ]);
        res.json({ items, total });
    }),
);

adminRouter.patch(
    '/applications/:id',
    ah(async (req, res) => {
        const parsed = applicationUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        try {
            const application = await prisma.application.update({ where: { id: req.params.id }, data: parsed.data });
            return res.json(application);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Application not found' });
            }
            throw err;
        }
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// LMS scaffold: people (students/tutors), enrollments, course modules
// ────────────────────────────────────────────────────────────────────────────

adminRouter.get(
    '/lms/users',
    ah(async (req, res) => {
        const role = typeof req.query.role === 'string' ? req.query.role : undefined;
        const users = await prisma.lmsUser.findMany({
            where: role ? { role } : {},
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        res.json({ items: users, total: users.length });
    }),
);

adminRouter.post(
    '/lms/users',
    ah(async (req, res) => {
        const parsed = lmsUserUpsertSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.lmsUser.upsert({
            where: { email },
            update: { name: parsed.data.name, role: parsed.data.role },
            create: { ...parsed.data, email },
        });
        res.status(201).json(user);
    }),
);

adminRouter.patch(
    '/lms/users/:id',
    ah(async (req, res) => {
        const parsed = lmsUserUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        try {
            const user = await prisma.lmsUser.update({ where: { id: req.params.id }, data: parsed.data });
            return res.json(user);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'User not found' });
            }
            throw err;
        }
    }),
);

adminRouter.get(
    '/lms/enrollments',
    ah(async (_req, res) => {
        const items = await prisma.enrollment.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200,
            include: {
                student: { select: { name: true, email: true } },
                tutor: { select: { name: true, email: true } },
                course: { select: { title: true, slug: true } },
            },
        });
        res.json({ items, total: items.length });
    }),
);

adminRouter.post(
    '/lms/enrollments',
    ah(async (req, res) => {
        const parsed = enrollmentUpsertSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const { studentEmail, courseSlug, tutorEmail, status, progress } = parsed.data;

        const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
        if (!course) return res.status(404).json({ message: `No course with slug "${courseSlug}"` });

        const student = await prisma.lmsUser.upsert({
            where: { email: studentEmail.toLowerCase() },
            update: {},
            create: { email: studentEmail.toLowerCase(), name: studentEmail.split('@')[0], role: 'student' },
        });

        let tutorId: string | undefined;
        if (tutorEmail) {
            const tutor = await prisma.lmsUser.findUnique({ where: { email: tutorEmail.toLowerCase() } });
            if (!tutor || tutor.role === 'student') {
                return res.status(400).json({ message: `No tutor account for "${tutorEmail}" — create the tutor first` });
            }
            tutorId = tutor.id;
        }

        try {
            const enrollment = await prisma.enrollment.create({
                data: {
                    courseId: course.id,
                    studentId: student.id,
                    tutorId,
                    status: status ?? 'active',
                    progress: progress ?? 0,
                },
            });
            return res.status(201).json(enrollment);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                return res.status(409).json({ message: 'Student is already enrolled in this course' });
            }
            throw err;
        }
    }),
);

adminRouter.patch(
    '/lms/enrollments/:id',
    ah(async (req, res) => {
        const parsed = enrollmentUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const data: Record<string, unknown> = { ...parsed.data };
        if ('tutorEmail' in parsed.data) {
            delete data.tutorEmail;
            if (parsed.data.tutorEmail === null) {
                data.tutorId = null;
            } else if (parsed.data.tutorEmail) {
                const tutor = await prisma.lmsUser.findUnique({ where: { email: parsed.data.tutorEmail.toLowerCase() } });
                if (!tutor || tutor.role === 'student') {
                    return res.status(400).json({ message: `No tutor account for "${parsed.data.tutorEmail}"` });
                }
                data.tutorId = tutor.id;
            }
        }
        try {
            const enrollment = await prisma.enrollment.update({ where: { id: req.params.id }, data });
            return res.json(enrollment);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Enrollment not found' });
            }
            throw err;
        }
    }),
);

adminRouter.get(
    '/lms/modules',
    ah(async (req, res) => {
        const courseSlug = typeof req.query.courseSlug === 'string' ? req.query.courseSlug : undefined;
        const items = await prisma.courseModule.findMany({
            where: courseSlug ? { course: { slug: courseSlug } } : {},
            orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
            take: 500,
            include: { course: { select: { slug: true, title: true } } },
        });
        res.json({ items, total: items.length });
    }),
);

adminRouter.post(
    '/lms/modules',
    ah(async (req, res) => {
        const parsed = courseModuleUpsertSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const { courseSlug, ...data } = parsed.data;
        const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
        if (!course) return res.status(404).json({ message: `No course with slug "${courseSlug}"` });
        const mod = await prisma.courseModule.create({ data: { ...data, courseId: course.id } });
        return res.status(201).json(mod);
    }),
);

adminRouter.patch(
    '/lms/modules/:id',
    ah(async (req, res) => {
        const parsed = courseModuleUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        try {
            const mod = await prisma.courseModule.update({ where: { id: req.params.id }, data: parsed.data });
            return res.json(mod);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Module not found' });
            }
            throw err;
        }
    }),
);

adminRouter.delete(
    '/lms/modules/:id',
    ah(async (req, res) => {
        try {
            await prisma.courseModule.delete({ where: { id: req.params.id } });
            return res.status(204).end();
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Module not found' });
            }
            throw err;
        }
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Recordings (patch-22): per-course session recording links
// ────────────────────────────────────────────────────────────────────────────

adminRouter.get(
    '/lms/recordings',
    ah(async (req, res) => {
        const courseSlug = typeof req.query.courseSlug === 'string' ? req.query.courseSlug : undefined;
        const items = await prisma.recording.findMany({
            where: courseSlug ? { course: { slug: courseSlug } } : {},
            orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
            take: 500,
            include: { course: { select: { slug: true, title: true } } },
        });
        res.json({ items, total: items.length });
    }),
);

adminRouter.post(
    '/lms/recordings',
    ah(async (req, res) => {
        const parsed = recordingUpsertSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        const { courseSlug, ...data } = parsed.data;
        const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
        if (!course) return res.status(404).json({ message: `No course with slug "${courseSlug}"` });
        const rec = await prisma.recording.create({ data: { ...data, courseId: course.id } });
        return res.status(201).json(rec);
    }),
);

adminRouter.patch(
    '/lms/recordings/:id',
    ah(async (req, res) => {
        const parsed = recordingUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        try {
            const rec = await prisma.recording.update({ where: { id: req.params.id }, data: parsed.data });
            return res.json(rec);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Recording not found' });
            }
            throw err;
        }
    }),
);

adminRouter.delete(
    '/lms/recordings/:id',
    ah(async (req, res) => {
        try {
            await prisma.recording.delete({ where: { id: req.params.id } });
            return res.status(204).end();
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ message: 'Recording not found' });
            }
            throw err;
        }
    }),
);
