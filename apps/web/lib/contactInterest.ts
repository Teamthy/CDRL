/**
 * `/contact?interest=…` handling (audit UX-17).
 *
 * The events page links to `/contact?interest=<event-slug>` for every event
 * without a registration URL, but the form never looked at the query string:
 * the visitor arrived at a blank "Select an area" dropdown with no sign of
 * what they had clicked, and the enquiry reached the inbox with no idea which
 * event prompted it.
 */

/** The fixed options the dropdown has always offered. */
export const INTEREST_OPTIONS = [
    'Professional Training',
    'Corporate Training',
    'Advisory & Consulting',
    'Partnership',
] as const;

/** The API caps `interest` at 80 characters. */
const INTEREST_MAX_LENGTH = 80;

/** "iso-27001-lead-implementer-lagos" → "ISO 27001 Lead Implementer Lagos" */
export function humanizeSlug(slug: string): string {
    return slug
        .split(/[-_]+/)
        .filter(Boolean)
        .map((word) => (/^(iso|iec|pecb|ai|ndpa|grc|dpo)$/i.test(word) ? word.toUpperCase() : word))
        .map((word) => (word === word.toUpperCase() ? word : word[0]!.toUpperCase() + word.slice(1)))
        .join(' ');
}

/**
 * Resolve the `interest` query parameter to a value the dropdown can show.
 *
 * Returns null when there is nothing usable, so the form falls back to its
 * normal empty state.
 */
export function resolveInterest(raw: string | null | undefined): string | null {
    const value = raw?.trim();
    if (!value) return null;

    const known = INTEREST_OPTIONS.find((option) => option.toLowerCase() === value.toLowerCase());
    if (known) return known;

    // Anything else is a slug from elsewhere on the site — most often an event.
    const label = humanizeSlug(value);
    if (!label) return null;
    return label.slice(0, INTEREST_MAX_LENGTH);
}
