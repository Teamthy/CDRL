/**
 * Date formatting for server-rendered pages (audit UX-22).
 *
 * `/events`, `/news` and `/news/<slug>` are ISR pages: their HTML is produced
 * once on the server and then served to everyone until it revalidates. Calling
 * `toLocaleDateString('en-NG', …)` with no `timeZone` formats in whatever zone
 * the container happens to run in — UTC in every deployment target this repo
 * has — so an event that starts at 00:30 WAT rendered as the PREVIOUS day, and
 * the result was cached that way for everyone.
 *
 * The business is in Lagos and publishes Lagos dates, so that is pinned here
 * rather than left to the host.
 */
export const SITE_TIME_ZONE = 'Africa/Lagos';
export const SITE_LOCALE = 'en-NG';

/** "Monday" */
export function formatWeekday(iso: string | Date): string {
    return new Date(iso).toLocaleDateString(SITE_LOCALE, {
        weekday: 'long',
        timeZone: SITE_TIME_ZONE,
    });
}

/** "12 October 2026" */
export function formatLongDate(iso: string | Date): string {
    return new Date(iso).toLocaleDateString(SITE_LOCALE, {
        dateStyle: 'long',
        timeZone: SITE_TIME_ZONE,
    });
}

/** "12 Oct 2026" */
export function formatMediumDate(iso: string | Date): string {
    return new Date(iso).toLocaleDateString(SITE_LOCALE, {
        dateStyle: 'medium',
        timeZone: SITE_TIME_ZONE,
    });
}

/** Weekday + long date, as the events cards show it. */
export function formatEventDate(iso: string | Date): { day: string; label: string } {
    return { day: formatWeekday(iso), label: formatLongDate(iso) };
}
