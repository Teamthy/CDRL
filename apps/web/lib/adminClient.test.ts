import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Audit finding P0-3: the console asked every list endpoint for `?limit=200`,
 * but the API's listQuerySchema capped limit at 100. safeParse failed, the
 * handlers fell back to `{ limit: 50 }`, and the admin saw 50 of 141 courses
 * with nothing on screen saying rows were missing.
 *
 * Places that need the WHOLE collection (bundle pickers, slug checks, the exam
 * planner) now page through it via adminFetchAll rather than hoping one
 * hard-coded page is big enough.
 */

function installBrowserGlobals() {
    const store = new Map<string, string>([['ykay_admin_token', 'admin-token']]);
    const localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
    };
    vi.stubGlobal('window', { localStorage, location: { pathname: '/admin/courses', assign: vi.fn() } });
    vi.stubGlobal('localStorage', localStorage);
}

function jsonResponse(body: unknown, status = 200) {
    return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

/** Serves `total` numbered rows in pages, honouring limit/offset like the API. */
function pagedServer(total: number) {
    const requests: { limit: number; offset: number }[] = [];
    const fetchMock = vi.fn(async (url: string) => {
        const parsed = new URL(url, 'http://localhost');
        const limit = Number(parsed.searchParams.get('limit'));
        const offset = Number(parsed.searchParams.get('offset'));
        requests.push({ limit, offset });
        const items = Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => ({
            id: `row-${offset + i}`,
        }));
        return jsonResponse({ items, total });
    });
    return { fetchMock, requests };
}

describe('adminFetchAll', () => {
    beforeEach(() => installBrowserGlobals());
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
    });

    it('returns every row when the collection fits in one page', async () => {
        const { fetchMock, requests } = pagedServer(12);
        vi.stubGlobal('fetch', fetchMock);

        const { adminFetchAll } = await import('./adminClient');
        const rows = await adminFetchAll<{ id: string }>('/admin/courses');

        expect(rows).toHaveLength(12);
        expect(requests).toHaveLength(1);
    });

    it('pages past the server cap — 141 courses no longer truncate to 50', async () => {
        const { fetchMock, requests } = pagedServer(141);
        vi.stubGlobal('fetch', fetchMock);

        const { adminFetchAll, LIST_LIMIT_MAX } = await import('./adminClient');
        const rows = await adminFetchAll<{ id: string }>('/admin/courses');

        expect(rows).toHaveLength(141);
        expect(new Set(rows.map((r) => r.id)).size).toBe(141);
        for (const req of requests) expect(req.limit).toBeLessThanOrEqual(LIST_LIMIT_MAX);
    });

    it('keeps paging when the collection is larger than the max page size', async () => {
        const { fetchMock, requests } = pagedServer(450);
        vi.stubGlobal('fetch', fetchMock);

        const { adminFetchAll } = await import('./adminClient');
        const rows = await adminFetchAll<{ id: string }>('/admin/courses');

        expect(rows).toHaveLength(450);
        expect(requests.length).toBeGreaterThan(1);
        expect(requests.map((r) => r.offset)).toEqual([0, 200, 400]);
    });

    it('never requests a limit the API would clamp away', async () => {
        const { fetchMock, requests } = pagedServer(10);
        vi.stubGlobal('fetch', fetchMock);

        const { adminFetchAll, LIST_LIMIT_MAX } = await import('./adminClient');
        await adminFetchAll('/admin/courses');

        // The old code hard-coded 200 against a server cap of 100.
        expect(requests[0]!.limit).toBe(LIST_LIMIT_MAX);
    });

    it('tolerates an endpoint that already carries a query string', async () => {
        const { fetchMock } = pagedServer(3);
        vi.stubGlobal('fetch', fetchMock);

        const { adminFetchAll } = await import('./adminClient');
        await adminFetchAll('/admin/applications?status=new');

        expect(fetchMock.mock.calls[0]![0]).toContain('/admin/applications?status=new&limit=');
    });

    it('does not spin forever when the server reports a bogus total', async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ items: [], total: 9999 }));
        vi.stubGlobal('fetch', fetchMock);

        const { adminFetchAll } = await import('./adminClient');
        const rows = await adminFetchAll('/admin/courses');

        expect(rows).toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
