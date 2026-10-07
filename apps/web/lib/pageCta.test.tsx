import { describe, expect, it } from 'vitest';
import CTASection from '../components/sections/CTASection';
import { DEFAULT_FOOTER_CTA, hasPageContactCta } from './pageCta';

/**
 * Single-CTA policy: a page that already ends with its own contact CTA
 * ("Get in touch", "Request a proposal", …) must not also show the generic
 * footer button ("Talk to our team"). Pages without one keep the footer CTA.
 */
describe('hasPageContactCta', () => {
    it('detects a CTASection with its default /contact target', () => {
        const page = (
            <>
                <h1>Research</h1>
                <CTASection heading="Want to collaborate on research?" ctaLabel="Get in touch" />
            </>
        );
        expect(hasPageContactCta(page)).toBe(true);
    });

    it('detects a CTASection nested inside page content', () => {
        const page = (
            <section className="page-cta">
                <div className="wrap">
                    <CTASection ctaLabel="Request a proposal" />
                </div>
            </section>
        );
        expect(hasPageContactCta(page)).toBe(true);
    });

    it('detects an explicit /contact href, including query strings', () => {
        expect(hasPageContactCta(<CTASection ctaHref={'/contact'} />)).toBe(true);
        expect(hasPageContactCta(<CTASection ctaHref={'/contact?interest=iso-27001'} />)).toBe(true);
    });

    it('keeps the footer CTA when the page CTA points somewhere else', () => {
        expect(hasPageContactCta(<CTASection ctaHref={'/training-pricing'} />)).toBe(false);
    });

    it('detects a primary button link to /contact', () => {
        const page = (
            <a href={'/contact'} className="btn btn-primary">
                <span>Complete Enquiry</span>
            </a>
        );
        expect(hasPageContactCta(page)).toBe(true);
    });

    it('ignores secondary buttons and inline text links', () => {
        expect(
            hasPageContactCta(
                <a href={'/training'} className="btn btn-secondary">
                    Explore Training
                </a>,
            ),
        ).toBe(false);
        expect(
            hasPageContactCta(
                <p>
                    Read more in our{' '}
                    <a href={'/contact'} className="text-link">
                        contact page
                    </a>
                    .
                </p>,
            ),
        ).toBe(false);
    });

    it('returns false for pages with no contact CTA at all', () => {
        expect(
            hasPageContactCta(
                <>
                    <h1>Training</h1>
                    <a href={'/training-pricing'} className="btn btn-primary">
                        See prices
                    </a>
                </>,
            ),
        ).toBe(false);
        expect(hasPageContactCta(null)).toBe(false);
    });
});

describe('DEFAULT_FOOTER_CTA', () => {
    it('is the generic contact button shown only on pages without their own', () => {
        expect(DEFAULT_FOOTER_CTA).toEqual({ label: 'Talk to our team', href: '/contact' });
    });
});
