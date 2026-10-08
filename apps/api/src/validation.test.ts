import { describe, expect, it } from 'vitest';
import {
    contactSchema,
    listQuerySchema,
    LIST_LIMIT_DEFAULT,
    LIST_LIMIT_MAX,
    recordingUpsertSchema,
    isValidSessionId,
    learningPlanItemSchema,
    courseModuleUpdateSchema,
    courseModuleUpsertSchema,
} from './validation.js';

describe('contactSchema', () => {
    const valid = {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        organization: 'CDRL',
        interest: 'Professional Training',
        message: 'I would like to know more about your programs.',
    };

    it('accepts a fully populated valid payload', () => {
        expect(contactSchema.safeParse(valid).success).toBe(true);
    });

    it('accepts the payload without optional fields', () => {
        const { email: _e, organization: _o, ...minimal } = valid;
        expect(contactSchema.safeParse(minimal).success).toBe(true);
    });

    it('rejects empty required fields', () => {
        for (const key of ['name', 'interest', 'message'] as const) {
            expect(contactSchema.safeParse({ ...valid, [key]: '' }).success).toBe(false);
        }
    });

    it('rejects whitespace-only required fields', () => {
        expect(contactSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
    });

    it('rejects an invalid email format when provided', () => {
        expect(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
    });

    it('rejects oversized payloads (unbounded-input DoS guard)', () => {
        expect(contactSchema.safeParse({ ...valid, name: 'x'.repeat(121) }).success).toBe(false);
        expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(5001) }).success).toBe(false);
        expect(contactSchema.safeParse({ ...valid, interest: 'x'.repeat(81) }).success).toBe(false);
    });

    it('trims surrounding whitespace', () => {
        const parsed = contactSchema.parse({ ...valid, name: '  Ada  ' });
        expect(parsed.name).toBe('Ada');
    });
});

describe('learningPlanItemSchema', () => {
    it('accepts a course id', () => {
        expect(learningPlanItemSchema.safeParse({ courseId: 'clx123' }).success).toBe(true);
    });

    it('rejects missing or oversized course ids', () => {
        expect(learningPlanItemSchema.safeParse({}).success).toBe(false);
        expect(learningPlanItemSchema.safeParse({ courseId: '' }).success).toBe(false);
        expect(learningPlanItemSchema.safeParse({ courseId: 'x'.repeat(65) }).success).toBe(false);
    });
});

describe('isValidSessionId', () => {
    it('accepts a uuid-like id', () => {
        expect(isValidSessionId('c6b2f6f4-2f6a-4f4e-9b8a-3d2f0a1b2c3d')).toBe(true);
    });

    it('rejects non-strings, empty and absurdly long values', () => {
        expect(isValidSessionId(undefined)).toBe(false);
        expect(isValidSessionId(null)).toBe(false);
        expect(isValidSessionId(42)).toBe(false);
        expect(isValidSessionId('')).toBe(false);
        expect(isValidSessionId('x'.repeat(129))).toBe(false);
    });
});


describe('course module schemas (patch-19)', () => {
    it('upsert defaults published=true when omitted', () => {
        const r = courseModuleUpsertSchema.parse({ courseSlug: 'x', title: 'M1' });
        expect(r.published).toBe(true);
    });
    it('update accepts a pure publish toggle', () => {
        expect(courseModuleUpdateSchema.parse({ published: false })).toEqual({ published: false });
    });
    it('update rejects empty payloads is fine but title must be non-empty when present', () => {
        expect(courseModuleUpdateSchema.safeParse({ title: '' }).success).toBe(false);
    });
});

describe('recording schemas (patch-22)', () => {
    it('upsert defaults published + order', () => {
        const r = recordingUpsertSchema.parse({ courseSlug: 'c', title: 'Session 1', url: 'https://youtu.be/abc123XYz' });
        expect(r.published).toBe(true);
        expect(r.order).toBe(0);
    });
    it('upsert rejects non-URLs', () => {
        expect(recordingUpsertSchema.safeParse({ courseSlug: 'c', title: 'S1', url: 'not-a-url' }).success).toBe(false);
    });
});

describe('listQuerySchema (audit P0-3)', () => {
    it('accepts the page size the admin console actually asks for', () => {
        const parsed = listQuerySchema.safeParse({ limit: '200' });
        expect(parsed.success).toBe(true);
        expect(parsed.success && parsed.data.limit).toBe(200);
    });

    it('clamps an oversized limit instead of failing into the 50-row fallback', () => {
        const parsed = listQuerySchema.safeParse({ limit: '100000' });
        expect(parsed.success).toBe(true);
        expect(parsed.success && parsed.data.limit).toBe(LIST_LIMIT_MAX);
    });

    it('clamps nonsense values rather than rejecting the whole query', () => {
        for (const limit of ['0', '-5', 'abc', '']) {
            const parsed = listQuerySchema.safeParse({ limit });
            expect(parsed.success).toBe(true);
            expect(parsed.success && parsed.data.limit).toBeGreaterThanOrEqual(1);
            expect(parsed.success && parsed.data.limit).toBeLessThanOrEqual(LIST_LIMIT_MAX);
        }
    });

    it('defaults sensibly and never returns a negative offset', () => {
        const empty = listQuerySchema.safeParse({});
        expect(empty.success && empty.data).toEqual({ status: undefined, limit: LIST_LIMIT_DEFAULT, offset: 0 });

        const negative = listQuerySchema.safeParse({ offset: '-10' });
        expect(negative.success && negative.data.offset).toBe(0);
    });

    it('keeps paging usable: offset survives alongside limit', () => {
        const parsed = listQuerySchema.safeParse({ limit: '50', offset: '100' });
        expect(parsed.success && parsed.data).toMatchObject({ limit: 50, offset: 100 });
    });
});
