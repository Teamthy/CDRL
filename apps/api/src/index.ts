import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Prisma } from '@prisma/client';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';
import { config, corsOrigins } from './config.js';
import { prisma } from './db.js';
import { adminRouter } from './admin.js';
import { logger } from './logger.js';
import { applicationSchema, contactSchema, isValidSessionId, learningPlanItemSchema } from './validation.js';

// ────────────────────────────────────────────────────────────────────────────
// Core plumbing
// ────────────────────────────────────────────────────────────────────────────

/** Wrap async route handlers so rejections reach the error middleware
 *  instead of becoming unhandled rejections that kill the process. */
const ah =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

// ────────────────────────────────────────────────────────────────────────────
// Rate limiting (shared via Redis when REDIS_URL is set)
// ────────────────────────────────────────────────────────────────────────────

let redis: Redis | null = null;
const mutationLimiter = (() => {
    if (config.REDIS_URL) {
        redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
        redis.on('error', (err) => logger.warn({ err }, 'redis error (rate limiter store)'));
        logger.info('rate limiting backed by Redis');
        return new RateLimiterRedis({
            storeClient: redis,
            points: config.RATE_LIMIT_POINTS,
            duration: config.RATE_LIMIT_DURATION,
            keyPrefix: 'cdrl:rl',
        });
    }
    if (config.NODE_ENV === 'production') {
        logger.warn('REDIS_URL not set — in-memory rate limiting only works correctly on a single instance');
    }
    return new RateLimiterMemory({ points: config.RATE_LIMIT_POINTS, duration: config.RATE_LIMIT_DURATION });
})();

async function rateLimitMutations(req: Request, res: Response, next: NextFunction) {
    try {
        await mutationLimiter.consume(req.ip ?? 'unknown');
        next();
    } catch (err) {
        if (err instanceof Error) {
            // rate-limiter store failure — treat as a server error, not a 429
            next(err);
            return;
        }
        res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Optional contact-notification mailer
// ────────────────────────────────────────────────────────────────────────────

const transporter: nodemailer.Transporter | null =
    config.SMTP_HOST && config.SMTP_USER
        ? nodemailer.createTransport({
              host: config.SMTP_HOST,
              port: config.SMTP_PORT,
              secure: config.SMTP_SECURE === 'true',
              auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
          })
        : null;

// ────────────────────────────────────────────────────────────────────────────
// App wiring
// ────────────────────────────────────────────────────────────────────────────

const app = express();
app.set('trust proxy', 1); // one reverse proxy in front; req.ip is the real client IP
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins }));
app.use(express.json({ limit: '50kb' }));

// Structured request logging
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const ms = Math.round(Number(process.hrtime.bigint() - start) / 1e5) / 10;
        logger.info({ method: req.method, path: req.originalUrl, status: res.statusCode, ms }, 'request');
    });
    next();
});

// ────────────────────────────────────────────────────────────────────────────
// Health: shallow liveness + deep readiness
// ────────────────────────────────────────────────────────────────────────────

app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get(
    '/api/v1/ready',
    ah(async (_req, res) => {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ready' });
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Courses & content (public, cacheable)
// ────────────────────────────────────────────────────────────────────────────

app.get(
    '/api/v1/courses',
    ah(async (req, res) => {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const track = typeof req.query.track === 'string' ? req.query.track.trim() : '';
        const courses = await prisma.course.findMany({
            where: {
                published: true,
                ...(track ? { track } : {}),
                ...(search
                    ? {
                          OR: [
                              { title: { contains: search, mode: 'insensitive' } },
                              { subtitle: { contains: search, mode: 'insensitive' } },
                          ],
                      }
                    : {}),
            },
            orderBy: { sortOrder: 'asc' },
            take: 200,
        });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(courses);
    }),
);

app.get(
    '/api/v1/courses/:slug',
    ah(async (req, res) => {
        const course = await prisma.course.findFirst({
            where: { slug: req.params.slug, published: true },
        });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(course);
    }),
);

app.get(
    '/api/v1/content/:page',
    ah(async (req, res) => {
        const content = await prisma.siteContent.findUnique({ where: { pageKey: req.params.page } });
        if (!content) return res.status(404).json({ message: 'Content not found' });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(content.content);
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Contact enquiries
// ────────────────────────────────────────────────────────────────────────────

app.post(
    '/api/v1/contact',
    rateLimitMutations,
    ah(async (req, res) => {
        const parsed = contactSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        }
        const enquiry = await prisma.contactEnquiry.create({ data: parsed.data });
        logger.info({ enquiryId: enquiry.id, interest: enquiry.interest }, 'contact enquiry received');

        if (transporter) {
            try {
                await transporter.sendMail({
                    from: config.SMTP_FROM,
                    to: config.NOTIFY_EMAIL || config.SMTP_USER,
                    subject: `New contact enquiry: ${parsed.data.interest}`,
                    // NOTE: real newlines — NOT the literal "\n" characters the old code emitted
                    text: [
                        `Name: ${parsed.data.name}`,
                        `Email: ${parsed.data.email || 'N/A'}`,
                        `Organization: ${parsed.data.organization || 'N/A'}`,
                        `Interest: ${parsed.data.interest}`,
                        '',
                        'Message:',
                        parsed.data.message,
                    ].join('\n'),
                });
            } catch (err) {
                logger.error({ err, enquiryId: enquiry.id }, 'failed to send contact notification email');
            }
        }
        // Do not echo the full enquiry (PII) back to the caller.
        res.status(201).json({ id: enquiry.id, status: enquiry.status, createdAt: enquiry.createdAt });
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Learning plan (anonymous, keyed by opaque client-session header)
// ────────────────────────────────────────────────────────────────────────────

app.get(
    '/api/v1/learning-plan',
    ah(async (req, res) => {
        const sessionId = req.headers['x-session-id'];
        if (!isValidSessionId(sessionId)) return res.json({ items: [] });
        const plan = await prisma.learningPlan.findUnique({
            where: { sessionId },
            include: { items: true },
        });
        res.json({ items: plan?.items ?? [] });
    }),
);

app.post(
    '/api/v1/learning-plan/items',
    rateLimitMutations,
    ah(async (req, res) => {
        const sessionId = req.headers['x-session-id'];
        const parsed = learningPlanItemSchema.safeParse(req.body);
        if (!isValidSessionId(sessionId) || !parsed.success) {
            return res.status(400).json({ message: 'Invalid request' });
        }
        const { courseId } = parsed.data;

        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) return res.status(400).json({ message: 'Unknown course' });

        // Race-safe: single upsert instead of find-then-create (two concurrent
        // first-adds for a session no longer throw P2002).
        const plan = await prisma.learningPlan.upsert({
            where: { sessionId },
            update: {},
            create: { sessionId },
        });

        try {
            const item = await prisma.learningPlanItem.upsert({
                where: { learningPlanId_courseId: { learningPlanId: plan.id, courseId } },
                update: {},
                create: { learningPlanId: plan.id, courseId },
            });
            res.status(201).json(item);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
                return res.status(400).json({ message: 'Unknown course' });
            }
            throw err;
        }
    }),
);

app.delete(
    '/api/v1/learning-plan/items/:courseId',
    rateLimitMutations,
    ah(async (req, res) => {
        const sessionId = req.headers['x-session-id'];
        if (!isValidSessionId(sessionId)) return res.status(404).json({ message: 'Plan not found' });
        const plan = await prisma.learningPlan.findUnique({ where: { sessionId } });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        await prisma.learningPlanItem.deleteMany({
            where: { learningPlanId: plan.id, courseId: req.params.courseId },
        });
        res.status(204).send();
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Published events & posts (public, cacheable)
// ────────────────────────────────────────────────────────────────────────────

app.get(
    '/api/v1/events',
    ah(async (_req, res) => {
        const events = await prisma.event.findMany({
            where: { published: true },
            orderBy: { startsAt: 'asc' },
            take: 100,
        });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(events);
    }),
);

app.get(
    '/api/v1/posts',
    ah(async (_req, res) => {
        const posts = await prisma.post.findMany({
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
            take: 100,
        });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(
            // List view never ships full bodies.
            posts.map(({ body: _body, ...rest }) => rest),
        );
    }),
);

app.get(
    '/api/v1/posts/:slug',
    ah(async (req, res) => {
        const post = await prisma.post.findFirst({ where: { slug: req.params.slug, published: true } });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(post);
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Training applications (public) — saved to DB + email notification
// ────────────────────────────────────────────────────────────────────────────

app.post(
    '/api/v1/applications',
    rateLimitMutations,
    ah(async (req, res) => {
        const parsed = applicationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        }
        const application = await prisma.application.create({ data: parsed.data });
        logger.info({ applicationId: application.id, course: application.courseSlug }, 'application received');

        if (transporter) {
            try {
                await transporter.sendMail({
                    from: config.SMTP_FROM,
                    to: config.NOTIFY_EMAIL || config.SMTP_USER,
                    subject: `New application: ${application.courseTitle || application.track || 'General'} — ${application.name}`,
                    text: [
                        `Name: ${application.name}`,
                        `Email: ${application.email}`,
                        `Phone: ${application.phone || 'N/A'}`,
                        `Course: ${application.courseTitle || 'N/A'} (${application.courseSlug || 'N/A'})`,
                        `Track: ${application.track || 'N/A'}`,
                        '',
                        'Background / current level:',
                        application.background || 'N/A',
                        '',
                        'Message:',
                        application.message || 'N/A',
                    ].join('\n'),
                });
            } catch (err) {
                logger.error({ err, applicationId: application.id }, 'failed to send application notification email');
            }
        }
        res.status(201).json({ id: application.id, status: application.status, createdAt: application.createdAt });
    }),
);

// ────────────────────────────────────────────────────────────────────────────
// Admin console (Phase A): solo-admin JWT login + guarded management routes
// ────────────────────────────────────────────────────────────────────────────

app.use('/api/v1/admin', adminRouter);

// ────────────────────────────────────────────────────────────────────────────
// 404 + centralized JSON error handling (must be LAST)
// ────────────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Malformed JSON body' });
    }
    logger.error({ err, method: req.method, path: req.originalUrl }, 'unhandled request error');
    res.status(500).json({ message: 'Internal server error' });
});

// ────────────────────────────────────────────────────────────────────────────
// Startup + graceful shutdown
// ────────────────────────────────────────────────────────────────────────────

const server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT, env: config.NODE_ENV }, 'API listening');
});

let shuttingDown = false;
async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'shutdown requested');
    server.close(async () => {
        try {
            await prisma.$disconnect();
            if (redis) await redis.quit();
            logger.info('shutdown complete');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'error during shutdown');
            process.exit(1);
        }
    });
    // Force-exit if connections linger beyond the grace period.
    setTimeout(() => {
        logger.warn('forced shutdown after timeout');
        process.exit(1);
    }, 10_000).unref();
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
// Last-resort visibility: with the async wrapper above these should be rare,
// but never let a rejection/exception pass silently again.
process.on('unhandledRejection', (reason) => logger.error({ err: reason }, 'unhandled promise rejection'));
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaught exception');
    void shutdown('uncaughtException');
});
