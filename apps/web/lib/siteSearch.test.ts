import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_EVENT, announceSearch, searchQueryFromLocation } from './siteSearch';

/**
 * Audit finding UX-16: the header search input carried nothing but a ref, a
 * placeholder and an aria-label — no value, no onChange, no form, no submit
 * handler, nowhere to show results. Typing and pressing Enter did nothing,
 * which reads as a broken site rather than a missing feature. (The header
 * button's aria-controls also pointed at an id no element had.)
 */
describe('searchQueryFromLocation', () => {
    it('reads the q parameter', () => {
        expect(searchQueryFromLocation('?q=iso%2027001')).toBe('iso 27001');
    });

    it('is empty when there is no query', () => {
        expect(searchQueryFromLocation('')).toBe('');
        expect(searchQueryFromLocation('?track=Cybersecurity')).toBe('');
    });

    it('survives other parameters alongside it', () => {
        expect(searchQueryFromLocation('?track=AI&q=lead+implementer')).toBe('lead implementer');
    });

    it('decodes a query containing an ampersand', () => {
        expect(searchQueryFromLocation(`?q=${encodeURIComponent('risk & privacy')}`)).toBe('risk & privacy');
    });
});

describe('announceSearch', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('dispatches the query so an already-mounted catalogue can react', () => {
        const dispatched: CustomEvent<string>[] = [];
        vi.stubGlobal('window', {
            dispatchEvent: (e: CustomEvent<string>) => void dispatched.push(e),
        });

        announceSearch('iso 27001');

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]!.type).toBe(SEARCH_EVENT);
        expect(dispatched[0]!.detail).toBe('iso 27001');
    });

    it('is a no-op on the server', () => {
        vi.stubGlobal('window', undefined);
        expect(() => announceSearch('anything')).not.toThrow();
    });
});
