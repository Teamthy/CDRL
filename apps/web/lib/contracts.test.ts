import { describe, expect, it } from 'vitest';
import { courseSchema, pageContentSchema } from './contracts';

/**
 * Regression tests for the API ↔ web contract break found in the production
 * audit: the API serves `deliveryMode`; early frontend code expected `mode`.
 */
describe('courseSchema', () => {
    const apiCourse = {
        id: 'clx123',
        slug: 'iso-iec-27001-foundation',
        title: 'ISO/IEC 27001',
        subtitle: 'Foundation',
        track: 'Cybersecurity',
        level: 'Foundation',
        deliveryMode: 'Self-paced',
        overview: 'An overview.',
    };

    it('accepts the canonical API course shape', () => {
        expect(courseSchema.safeParse(apiCourse).success).toBe(true);
    });

    it('rejects the legacy prototype shape (mode instead of deliveryMode)', () => {
        const { deliveryMode: _d, ...rest } = apiCourse;
        const legacy = { ...rest, mode: 'Self-paced' };
        expect(courseSchema.safeParse(legacy).success).toBe(false);
    });

    it('rejects payloads missing required fields', () => {
        const { overview: _o, ...missingOverview } = apiCourse;
        expect(courseSchema.safeParse(missingOverview).success).toBe(false);
        expect(courseSchema.safeParse(null).success).toBe(false);
        expect(courseSchema.safeParse([]).success).toBe(false);
    });
});

describe('pageContentSchema', () => {
    it('accepts a rendered page payload', () => {
        const content = {
            kicker: 'ABOUT CDRL',
            title: 'Purpose-led. Practice-focused. Africa-ready.',
            description: 'We help professionals lead with confidence.',
            blocks: [{ title: 'Who We Are', text: 'The Centre for Digital Risk & Leadership is...', items: ['A'] }],
        };
        expect(pageContentSchema.safeParse(content).success).toBe(true);
    });

    it('rejects content without blocks (pages render blocks unconditionally)', () => {
        const content = { kicker: 'X', title: 'T', description: 'D' };
        expect(pageContentSchema.safeParse(content).success).toBe(false);
    });
});
