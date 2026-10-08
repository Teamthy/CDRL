import { describe, expect, it } from 'vitest';
import {
    courseSchema,
    pageContentSchema,
    toCourseCardView,
    toCourseCardViews,
    type Course,
} from './contracts';

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

/**
 * Audit P1-8: catalogue pages hand their course array to client components, so
 * every property on it is serialized twice — once by the API, once into the RSC
 * payload. These tests pin the card view model to the fields a card actually
 * renders, so a widened `select` or a stray spread cannot quietly put the
 * long-form `details` body back on the wire.
 */
describe('toCourseCardView', () => {
    const full: Course = {
        id: 'c1',
        slug: 'iso-27001-lead-implementer',
        title: 'ISO/IEC 27001 Lead Implementer',
        subtitle: 'PECB Certified',
        track: 'Information Security',
        level: 'Professional',
        deliveryMode: 'Virtual',
        overview: 'A long overview paragraph that no card ever renders.',
        details: '## What is ISO/IEC 27001?\n'.repeat(400),
        priceBand: { individual: '₦450,000', corporate: '₦1,200,000' },
        priceKobo: 45_000_000,
        currency: 'NGN',
        sortOrder: 3,
    };

    it('keeps exactly the fields a course card renders', () => {
        expect(Object.keys(toCourseCardView(full)).sort()).toEqual([
            'deliveryMode',
            'id',
            'level',
            'slug',
            'subtitle',
            'title',
            'track',
        ]);
    });

    it('drops the long-form details body and the overview paragraph', () => {
        const card = toCourseCardView(full) as Record<string, unknown>;
        expect(card.details).toBeUndefined();
        expect(card.overview).toBeUndefined();
    });

    it('preserves the values the cards display', () => {
        expect(toCourseCardView(full)).toMatchObject({
            slug: 'iso-27001-lead-implementer',
            title: 'ISO/IEC 27001 Lead Implementer',
            subtitle: 'PECB Certified',
            track: 'Information Security',
            level: 'Professional',
            deliveryMode: 'Virtual',
        });
    });

    it('serializes to a far smaller payload than the full row', () => {
        const fullSize = JSON.stringify(full).length;
        const cardSize = JSON.stringify(toCourseCardView(full)).length;
        expect(cardSize).toBeLessThan(fullSize / 10);
    });

    it('maps a whole catalogue', () => {
        const cards = toCourseCardViews([full, { ...full, id: 'c2', slug: 'other' }]);
        expect(cards.map((c) => c.slug)).toEqual(['iso-27001-lead-implementer', 'other']);
        expect(cards.every((c) => !('details' in c))).toBe(true);
    });

    it('still parses a list row the API no longer sends details for', () => {
        const { details: _details, ...withoutBody } = full;
        const parsed = courseSchema.safeParse(withoutBody);
        expect(parsed.success).toBe(true);
        expect(parsed.success && parsed.data.details).toBeUndefined();
    });
});
