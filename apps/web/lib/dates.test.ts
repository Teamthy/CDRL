import { describe, expect, it } from 'vitest';
import { SITE_TIME_ZONE, formatEventDate, formatLongDate, formatMediumDate, formatWeekday } from './dates';

/**
 * Audit finding UX-22: /events, /news and /news/<slug> are ISR pages — their
 * HTML is produced once on the server and served to everyone until it
 * revalidates. They formatted dates with `toLocaleDateString('en-NG', …)` and
 * NO `timeZone`, so they rendered in whatever zone the container runs in (UTC
 * on every deployment target here). An event starting at 00:30 WAT is 23:30
 * UTC the previous day, so the page showed the wrong day — and cached it.
 */

/** 2026-10-12T00:30:00+01:00 — just past midnight in Lagos, still the 11th in UTC. */
const JUST_AFTER_MIDNIGHT_LAGOS = '2026-10-11T23:30:00.000Z';

describe('site date formatting', () => {
    it('is pinned to Lagos', () => {
        expect(SITE_TIME_ZONE).toBe('Africa/Lagos');
    });

    it('formats a just-after-midnight Lagos time as the Lagos day, not the UTC day', () => {
        expect(formatLongDate(JUST_AFTER_MIDNIGHT_LAGOS)).toContain('12');
        expect(formatLongDate(JUST_AFTER_MIDNIGHT_LAGOS)).toContain('October');
    });

    it('gets the weekday right across the same boundary', () => {
        // 12 October 2026 is a Monday in Lagos; 11 October is a Sunday in UTC.
        expect(formatWeekday(JUST_AFTER_MIDNIGHT_LAGOS)).toBe('Monday');
    });

    it('does not depend on the host timezone', () => {
        const fromHostTz = new Date(JUST_AFTER_MIDNIGHT_LAGOS).toLocaleDateString('en-NG', { dateStyle: 'long' });
        const pinned = formatLongDate(JUST_AFTER_MIDNIGHT_LAGOS);
        // Under TZ=UTC these differ, which is exactly the bug; pinned must be
        // the Lagos answer either way.
        expect(pinned).toContain('12');
        expect(typeof fromHostTz).toBe('string');
    });

    it('formats a mid-afternoon time identically in both zones', () => {
        expect(formatLongDate('2026-10-12T14:00:00.000Z')).toContain('12');
    });

    it('accepts a Date as well as an ISO string', () => {
        expect(formatMediumDate(new Date(JUST_AFTER_MIDNIGHT_LAGOS))).toContain('12');
    });

    it('formatEventDate returns the weekday and long label the cards render', () => {
        expect(formatEventDate(JUST_AFTER_MIDNIGHT_LAGOS)).toEqual({
            day: 'Monday',
            label: formatLongDate(JUST_AFTER_MIDNIGHT_LAGOS),
        });
    });
});
