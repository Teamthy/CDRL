import { z } from 'zod';

/**
 * Shared request validation. Kept dependency-light and side-effect free so it
 * can be unit-tested without config or a database.
 */

export const SESSION_ID_MAX_LENGTH = 128;
export const COURSE_ID_MAX_LENGTH = 64;

export const contactSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().email('Invalid email address').max(254).optional(),
    organization: z.string().trim().max(160).optional(),
    interest: z.string().trim().min(1, 'Interest is required').max(80),
    message: z.string().trim().min(1, 'Message is required').max(5000),
});

export const learningPlanItemSchema = z.object({
    courseId: z.string().trim().min(1).max(COURSE_ID_MAX_LENGTH),
});

/** Anonymous learning-plan sessions are client-generated opaque IDs. */
export function isValidSessionId(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= SESSION_ID_MAX_LENGTH;
}

// ────────────────────────────────────────────────────────────────────────────
// Admin console (Phase A)
// ────────────────────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const enquiryUpdateSchema = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
    notes: z.string().max(5000).nullable().optional(),
});

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase words separated by hyphens');

export const courseUpsertSchema = z.object({
    slug,
    title: z.string().min(1).max(200),
    subtitle: z.string().min(1).max(300),
    track: z.string().min(1).max(100),
    level: z.string().min(1).max(100),
    deliveryMode: z.string().min(1).max(100),
    overview: z.string().min(1),
    published: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
});

export const eventUpsertSchema = z.object({
    slug,
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(500),
    body: z.string().max(20000).nullable().optional(),
    location: z.string().max(200).nullable().optional(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date().nullable().optional(),
    registrationUrl: z.string().url().nullable().optional(),
    published: z.boolean().optional().default(false),
});

export const postUpsertSchema = z.object({
    slug,
    title: z.string().min(1).max(200),
    category: z.string().min(1).max(100),
    excerpt: z.string().min(1).max(500),
    body: z.string().min(1),
    coverImageUrl: z.string().url().nullable().optional(),
    publishedAt: z.coerce.date().nullable().optional(),
    published: z.boolean().optional().default(false),
});

export const listQuerySchema = z.object({
    status: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
});

// ────────────────────────────────────────────────────────────────────────────
// Applications + LMS scaffold (patch-15)
// ────────────────────────────────────────────────────────────────────────────

export const applicationSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
    courseSlug: z.string().max(120).optional(),
    courseTitle: z.string().max(200).optional(),
    track: z.string().max(100).optional(),
    background: z.string().max(5000).optional(),
    message: z.string().max(3000).optional(),
});

export const APPLICATION_STATUSES = ['new', 'contacted', 'admitted', 'enrolled', 'closed'] as const;

export const applicationUpdateSchema = z.object({
    status: z.enum(APPLICATION_STATUSES).optional(),
    notes: z.string().max(5000).nullable().optional(),
});

export const lmsUserUpsertSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    role: z.enum(['student', 'tutor']).default('student'),
});

export const lmsUserUpdateSchema = z.object({
    name: z.string().min(1).max(120).optional(),
    status: z.enum(['active', 'suspended', 'archived']).optional(),
});

export const enrollmentUpsertSchema = z.object({
    studentEmail: z.string().email(),
    courseSlug: z.string().min(1),
    tutorEmail: z.string().email().nullable().optional(),
    status: z.enum(['active', 'completed', 'paused']).optional(),
    progress: z.number().int().min(0).max(100).optional(),
});

export const enrollmentUpdateSchema = z.object({
    tutorEmail: z.string().email().nullable().optional(),
    status: z.enum(['active', 'completed', 'paused']).optional(),
    progress: z.number().int().min(0).max(100).optional(),
});

export const courseModuleUpsertSchema = z.object({
    courseSlug: z.string().min(1),
    title: z.string().min(1).max(200),
    order: z.number().int().min(0).optional().default(0),
    body: z.string().max(50000).nullable().optional(),
    published: z.boolean().optional().default(true),
});

export const courseModuleUpdateSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    order: z.number().int().min(0).optional(),
    body: z.string().max(50000).nullable().optional(),
    published: z.boolean().optional(),
});

// ─── Learner auth (patch-18) ────────────────────────────────────────────────
// bcrypt silently truncates at 72 bytes → hard cap; 8-char floor for learners.

export const learnerSignupSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).max(72),
});

export const learnerLoginSchema = z.object({
    email: z.string().trim().email().max(320),
    password: z.string().min(1).max(72),
});

export const learnerResetRequestSchema = z.object({
    email: z.string().trim().email().max(320),
});

export const learnerResetSchema = z.object({
    token: z.string().min(10).max(2000),
    password: z.string().min(8).max(72),
});
