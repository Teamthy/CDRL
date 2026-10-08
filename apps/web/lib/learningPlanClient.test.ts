import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Audit finding P1-9: one 6/min/IP bucket covered the contact form, course
 * applications AND every learning-plan mutation, so a visitor who added a few
 * courses got a 429 — and the client reported it as success. The button said
 * "Added to plan" and redirected to a plan that did not contain the course.
 *
 * These tests pin the client contract the button relies on: a rejected add
 * reports `ok: false`, says WHY, and must not write the item into the local
 * cache (which would fake a plan the backend never accepted).
 */

let cookie = '';

function installBrowserGlobals() {
    const store = new Map<string, string>();
    const localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
    };
    cookie = 'cdrl_session=11111111-1111-4111-8111-111111111111';
    const handlers = new Map<string, ((e: unknown) => void)[]>();
    vi.stubGlobal('localStorage', localStorage);
    vi.stubGlobal('window', {
        localStorage,
        addEventListener: (type: string, fn: (e: unknown) => void) => {
            handlers.set(type, [...(handlers.get(type) ?? []), fn]);
        },
        removeEventListener: (type: string, fn: (e: unknown) => void) => {
            handlers.set(type, (handlers.get(type) ?? []).filter((h) => h !== fn));
        },
    });
    vi.stubGlobal('document', {
        get cookie() {
            return cookie;
        },
        set cookie(v: string) {
            cookie = v.split(';')[0];
        },
    });
    /** Fire a cross-tab storage event the way a browser would. */
    const fireStorage = (key: string) => (handlers.get('storage') ?? []).forEach((h) => h({ key }));
    return { store, localStorage, fireStorage };
}

const LOCAL_STORAGE_KEY = 'cdrl-learning-plan';

/** The module keeps its local cache private; read it the way the browser would. */
function localPlan(store: Map<string, string>) {
    return JSON.parse(store.get(LOCAL_STORAGE_KEY) ?? '[]') as { courseId: string }[];
}

function response(status: number, body: unknown = {}) {
    return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

describe('addLearningPlanItem', () => {
    let globals: ReturnType<typeof installBrowserGlobals>;

    beforeEach(() => {
        globals = installBrowserGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
        vi.restoreAllMocks();
    });

    it('reports a 429 as a rate-limit failure, not success', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(429, { message: 'Too many requests.' })));
        const { addLearningPlanItem } = await import('./learningPlanClient');

        const result = await addLearningPlanItem('course-1');

        expect(result.ok).toBe(false);
        expect(result.ok === false && result.reason).toBe('rate-limited');
    });

    it('does not cache a throttled item locally', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(429)));
        const { addLearningPlanItem } = await import('./learningPlanClient');

        await addLearningPlanItem('course-1');

        expect(localPlan(globals.store)).toEqual([]);
        // and nothing was written under any other key either
        expect([...globals.store.values()].join('')).not.toContain('course-1');
    });

    it('distinguishes a server error from a rate limit', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(500)));
        const { addLearningPlanItem } = await import('./learningPlanClient');

        const result = await addLearningPlanItem('course-1');

        expect(result.ok).toBe(false);
        expect(result.ok === false && result.reason).toBe('error');
    });

    it('still succeeds, and caches, on a 2xx', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(201, { courseId: 'course-1' })));
        const { addLearningPlanItem } = await import('./learningPlanClient');

        const result = await addLearningPlanItem('course-1');

        expect(result.ok).toBe(true);
        expect(localPlan(globals.store)).toEqual([{ courseId: 'course-1' }]);
    });

    it('treats 409 (already in the plan) as success', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(409)));
        const { addLearningPlanItem } = await import('./learningPlanClient');

        const result = await addLearningPlanItem('course-1');

        expect(result.ok).toBe(true);
        expect(localPlan(globals.store)).toEqual([{ courseId: 'course-1' }]);
    });

    it('falls back to the local plan when the API is unreachable', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new Error('network down');
            }),
        );
        const { addLearningPlanItem } = await import('./learningPlanClient');

        const result = await addLearningPlanItem('course-1');

        expect(result.ok).toBe(true);
        expect(localPlan(globals.store)).toEqual([{ courseId: 'course-1' }]);
    });
});

describe('removeLearningPlanItem', () => {
    beforeEach(() => {
        installBrowserGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
        vi.restoreAllMocks();
    });

    it('surfaces a 429 rather than claiming the item was removed', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(429)));
        const { removeLearningPlanItem } = await import('./learningPlanClient');

        const result = await removeLearningPlanItem('course-1');

        expect(result.ok).toBe(false);
        expect(result.ok === false && result.reason).toBe('rate-limited');
    });

    it('treats a 404 as already gone', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(404)));
        const { removeLearningPlanItem } = await import('./learningPlanClient');

        expect((await removeLearningPlanItem('course-1')).ok).toBe(true);
    });
});

/**
 * Audit finding P1-15: the header badge re-fetched the whole plan on every
 * route change (useEffect keyed on `pathname`), which cost a request per
 * navigation and flickered the count to 0 while each one was in flight — and
 * still could not react to an add that happened without navigating.
 *
 * The badge now loads once and subscribes, so these are the guarantees it
 * depends on.
 */
describe('learning-plan subscription', () => {
    beforeEach(() => {
        installBrowserGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
        vi.restoreAllMocks();
    });

    it('notifies subscribers when an item is added', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(201)));
        const { addLearningPlanItem, subscribeToLearningPlan } = await import('./learningPlanClient');
        const seen: number[] = [];
        subscribeToLearningPlan((n) => seen.push(n));

        await addLearningPlanItem('course-1');

        expect(seen).toEqual([1]);
    });

    it('notifies subscribers when an item is removed', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(200)));
        const { addLearningPlanItem, removeLearningPlanItem, subscribeToLearningPlan } =
            await import('./learningPlanClient');
        await addLearningPlanItem('course-1');

        const seen: number[] = [];
        subscribeToLearningPlan((n) => seen.push(n));
        await removeLearningPlanItem('course-1');

        expect(seen).toEqual([0]);
    });

    it('does not notify a subscriber that has unsubscribed', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(201)));
        const { addLearningPlanItem, subscribeToLearningPlan } = await import('./learningPlanClient');
        const seen: number[] = [];
        const unsubscribe = subscribeToLearningPlan((n) => seen.push(n));

        unsubscribe();
        await addLearningPlanItem('course-1');

        expect(seen).toEqual([]);
    });

    it('does not notify when the server rejected the add', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(429)));
        const { addLearningPlanItem, subscribeToLearningPlan } = await import('./learningPlanClient');
        const seen: number[] = [];
        subscribeToLearningPlan((n) => seen.push(n));

        await addLearningPlanItem('course-1');

        expect(seen).toEqual([]);
    });

    it('picks up a change made in another tab', async () => {
        const globals = installBrowserGlobals();
        const { subscribeToLearningPlan } = await import('./learningPlanClient');
        const seen: number[] = [];
        subscribeToLearningPlan((n) => seen.push(n));

        // another tab wrote the shared key
        globals.store.set('cdrl-learning-plan', JSON.stringify([{ courseId: 'a' }, { courseId: 'b' }]));
        globals.fireStorage('cdrl-learning-plan');

        expect(seen).toEqual([2]);
    });

    it('ignores storage events for unrelated keys', async () => {
        const globals = installBrowserGlobals();
        const { subscribeToLearningPlan } = await import('./learningPlanClient');
        const seen: number[] = [];
        subscribeToLearningPlan((n) => seen.push(n));

        globals.fireStorage('some-other-app-key');

        expect(seen).toEqual([]);
    });

    it('reads the current count synchronously, with no request', async () => {
        const fetchMock = vi.fn(async () => response(201));
        vi.stubGlobal('fetch', fetchMock);
        const { addLearningPlanItem, localLearningPlanCount } = await import('./learningPlanClient');
        await addLearningPlanItem('course-1');
        fetchMock.mockClear();

        expect(localLearningPlanCount()).toBe(1);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
