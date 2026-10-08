/**
 * Header search → catalogue filter bridge (audit UX-16).
 *
 * The header submits a query by navigating to /training?q=…, which the
 * catalogue reads on mount. When the visitor is ALREADY on /training that
 * navigation does not remount anything, so the query is also announced as an
 * event. Kept here so both ends agree on the name.
 */
export const SEARCH_EVENT = 'cdrl:site-search';
export const SEARCH_PARAM = 'q';

export function announceSearch(query: string): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<string>(SEARCH_EVENT, { detail: query }));
}

/** Read the query the catalogue should start from. */
export function searchQueryFromLocation(search: string): string {
    return new URLSearchParams(search).get(SEARCH_PARAM) ?? '';
}
