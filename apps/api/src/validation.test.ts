import { describe, expect, it } from 'vitest';
import { contactSchema, isValidSessionId, learningPlanItemSchema } from './validation.js';

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
