import { beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * Audit finding P0-4: Enrollment, CourseModule, Recording and ModuleCompletion
 * are all `onDelete: Cascade` from Course, and the console's two-click delete
 * went straight to prisma.course.delete(). Removing a course therefore erased
 * every learner's enrolment and module progress for it — silently, with no
 * confirmation that anything beyond the course row was going away.
 *
 * The policy below is what now stands between that button and the data.
 */

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'correct-horse-battery';
process.env.ADMIN_JWT_SECRET = 'test-secret-test-secret-test-secret-32!';

// The policy is pure; the router around it is not. Keep Prisma out of the test.
vi.mock('./db.js', () => ({ prisma: {} }));

type AdminModule = typeof import('./admin.js');
let admin: AdminModule;

beforeAll(async () => {
    admin = await import('./admin.js');
});

describe('planCourseDelete', () => {
    const base = { hard: false, published: true, enrollments: 0, purchases: 0 };

    it('archives instead of destroying by default, even with no dependents', () => {
        expect(admin.planCourseDelete(base)).toEqual({ action: 'archive', alreadyArchived: false });
    });

    it('archives by default even when learners are enrolled', () => {
        expect(admin.planCourseDelete({ ...base, enrollments: 37 })).toEqual({
            action: 'archive',
            alreadyArchived: false,
        });
    });

    it('reports an already-unpublished course as a no-op archive', () => {
        expect(admin.planCourseDelete({ ...base, published: false })).toEqual({
            action: 'archive',
            alreadyArchived: true,
        });
    });

    it('refuses a hard delete while enrolments reference the course', () => {
        const plan = admin.planCourseDelete({ ...base, hard: true, enrollments: 12 });
        expect(plan.action).toBe('blocked');
        expect(plan).toMatchObject({ blockedBy: '12 enrolments' });
    });

    it('refuses a hard delete while purchases reference the course', () => {
        const plan = admin.planCourseDelete({ ...base, hard: true, purchases: 1 });
        expect(plan.action).toBe('blocked');
        expect(plan).toMatchObject({ blockedBy: '1 purchase' });
    });

    it('names both blockers when both exist', () => {
        const plan = admin.planCourseDelete({ ...base, hard: true, enrollments: 2, purchases: 3 });
        expect(plan).toMatchObject({ action: 'blocked', blockedBy: '2 enrolments and 3 purchases' });
    });

    it('allows a hard delete only when nothing references the course', () => {
        expect(admin.planCourseDelete({ ...base, hard: true })).toEqual({ action: 'destroy' });
    });
});

describe('wantsHardDelete', () => {
    it('is opt-in: a bare DELETE never destroys the row', () => {
        expect(admin.wantsHardDelete({})).toBe(false);
        expect(admin.wantsHardDelete({ hard: 'false' })).toBe(false);
        expect(admin.wantsHardDelete({ hard: 'yes' })).toBe(false);
    });

    it('accepts the explicit opt-in forms', () => {
        expect(admin.wantsHardDelete({ hard: 'true' })).toBe(true);
        expect(admin.wantsHardDelete({ hard: '1' })).toBe(true);
    });
});
