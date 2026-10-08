import { describe, expect, it } from 'vitest';
import { INTEREST_OPTIONS, humanizeSlug, resolveInterest } from './contactInterest';

/**
 * Audit finding UX-17: the events page links to
 * `/contact?interest=<event-slug>` for every event without a registration
 * URL, and ContactForm never read the query string. The visitor landed on a
 * blank "Select an area" dropdown with no sign of what they had clicked, and
 * the enquiry reached the inbox with no idea which event prompted it.
 */
describe('resolveInterest', () => {
    it('returns null when there is no parameter', () => {
        expect(resolveInterest(null)).toBeNull();
        expect(resolveInterest(undefined)).toBeNull();
        expect(resolveInterest('')).toBeNull();
        expect(resolveInterest('   ')).toBeNull();
    });

    it('matches a fixed option exactly', () => {
        expect(resolveInterest('Corporate Training')).toBe('Corporate Training');
    });

    it('matches a fixed option regardless of case', () => {
        expect(resolveInterest('partnership')).toBe('Partnership');
    });

    it('turns an event slug into a readable label', () => {
        expect(resolveInterest('lagos-cyber-summit-2026')).toBe('Lagos Cyber Summit 2026');
    });

    it('keeps standards acronyms upper case', () => {
        expect(resolveInterest('iso-27001-lead-implementer')).toBe('ISO 27001 Lead Implementer');
        expect(resolveInterest('pecb-ai-governance')).toBe('PECB AI Governance');
    });

    it('never exceeds the 80 characters the API accepts', () => {
        const long = Array.from({ length: 40 }, () => 'verylongword').join('-');
        expect(resolveInterest(long)!.length).toBeLessThanOrEqual(80);
    });

    it('returns null for a slug that is only separators', () => {
        expect(resolveInterest('---')).toBeNull();
    });
});

describe('humanizeSlug', () => {
    it('handles underscores as well as hyphens', () => {
        expect(humanizeSlug('data_protection_week')).toBe('Data Protection Week');
    });

    it('collapses repeated separators', () => {
        expect(humanizeSlug('a--b')).toBe('A B');
    });
});

describe('INTEREST_OPTIONS', () => {
    it('still lists the four areas the form has always offered', () => {
        expect(INTEREST_OPTIONS).toEqual([
            'Professional Training',
            'Corporate Training',
            'Advisory & Consulting',
            'Partnership',
        ]);
    });
});
