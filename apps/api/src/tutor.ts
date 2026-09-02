import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { z } from 'zod';
import { prisma } from './db.js';
import { logger } from './logger.js';
import { authenticate, requirePermission, type Principal } from './rbac.js';

const ah =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

// ────────────────────────────────────────────────────────────────────────────
// Tutor surface (patch-23): tutors grade THEIR OWN assigned enrollments only.
//
// AuthN — authenticate() resolves a learner token to {userId, role from DB}.
// AuthZ — requirePermission('enrollment:grade') caps by role (admin=*/tutor only);
//         every mutation then filters by tutorId = caller.id (ownership scope),
//         so a tutor cannot even name another tutor's row id to touch it.
// ────────────────────────────────────────────────────────────────────────────

const tutorLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

const gradeSchema = z.object({
    progress: z.number().int().min(0).max(100).optional(),
    status: z.enum(['active', 'completed', 'paused']).optional(),
});

export const tutorRouter = Router();
tutorRouter.use(authenticate);
tutorRouter.use(async (req, res, next) => {
    try {
        await tutorLimiter.consume(req.ip ?? 'unknown');
        next();
    } catch {
        res.status(429).json({ message: 'Too many attempts. Try again shortly.' });
    }
});

/** Caller must be a real tutor (not admin impersonation scope, not student). */
function tutorPrincipal(res: Response): Extract<Principal, { kind: 'learner' }> | null {
    const p = res.locals.principal as Principal | null;
    return p && p.kind === 'learner' && p.role === 'tutor' ? p : null;
}

// GET /api/v1/lms/tutor/enrollments — my assigned enrollments.
tutorRouter.get(
    '/enrollments',
    requirePermission('enrollment:read-assigned'),
    ah(async (_req, res) => {
        const me = tutorPrincipal(res);
        if (!me) return res.status(403).json({ message: 'Tutors only.' });
        const items = await prisma.enrollment.findMany({
            where: { tutorId: me.userId },
            orderBy: { createdAt: 'desc' },
            take: 500,
            include: {
                student: { select: { name: true, email: true } },
                course: { select: { title: true, slug: true, track: true } },
            },
        });
        return res.json({
            items: items.map((e) => ({
                id: e.id,
                status: e.status,
                progress: e.progress,
                student: e.student,
                course: e.course,
            })),
            total: items.length,
        });
    }),
);

// PATCH /api/v1/lms/tutor/enrollments/:id — grade OWN enrollment only.
tutorRouter.patch(
    '/enrollments/:id',
    requirePermission('enrollment:grade'),
    ah(async (req, res) => {
        const me = tutorPrincipal(res);
        if (!me) return res.status(403).json({ message: 'Tutors only.' });
        const parsed = gradeSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });

        // Ownership scope in the WHERE clause itself — no read-then-compare gap.
        const result = await prisma.enrollment.updateMany({
            where: { id: req.params.id, tutorId: me.userId },
            data: parsed.data,
        });
        if (result.count === 0) {
            // Don't reveal whether the row exists but belongs to someone else.
            return res.status(404).json({ message: 'Not found or not assigned to you' });
        }
        logger.info({ tutorId: me.userId, enrollmentId: req.params.id, ...parsed.data }, 'tutor graded enrollment');
        const updated = await prisma.enrollment.findUnique({
            where: { id: req.params.id },
            include: {
                student: { select: { name: true, email: true } },
                course: { select: { title: true, slug: true, track: true } },
            },
        });
        return res.json(updated);
    }),
);
