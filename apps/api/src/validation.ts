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
