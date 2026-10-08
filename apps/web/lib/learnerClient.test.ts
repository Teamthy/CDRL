import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Audit finding P0-1: `post()` (learnerSignIn / learnerSignUp / forgot / reset)
 * omitted `credentials: 'include'`. The web app and the API are cross-origin, so
 * the browser DISCARDED the httpOnly refresh cookie that login/signup set — which
 * made /learner/refresh a guaranteed 401 and killed every session at the access
 * token's TTL.
 *
 * The invariant these tests protect: EVERY learner API call made by this client
 * sends credentials, so the refresh cookie is both stored and replayed.
 */

type FetchCall = [string, RequestInit | undefined];

function installBrowserGlobals() {
    const store = new Map<string, string>();
    const localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
    };
    vi.stubGlobal('window', { localStorage, location: { pathname: '/' } });
    vi.stubGlobal('localStorage', localStorage);
    return localStorage;
}

function jsonResponse(body: unknown, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    } as unknown as Response;
}

describe('learnerClient credentials', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        installBrowserGlobals();
        fetchMock = vi.fn(async () => jsonResponse({ token: 'tok', user: { id: 'u1' }, ok: true }));
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
    });

    const calls = (): FetchCall[] => fetchMock.mock.calls as unknown as FetchCall[];

    it('sends credentials on sign-in so the refresh cookie is stored', async () => {
        const { learnerSignIn } = await import('./learnerClient');
        await learnerSignIn('ada@example.com', 'hunter2hunter2');

        const [url, init] = calls()[0]!;
        expect(url).toContain('/learner/login');
        expect(init?.credentials).toBe('include');
    });

    it('sends credentials on sign-up so the refresh cookie is stored', async () => {
        const { learnerSignUp } = await import('./learnerClient');
        await learnerSignUp('Ada', 'ada@example.com', 'hunter2hunter2');

        const [url, init] = calls()[0]!;
        expect(url).toContain('/learner/signup');
        expect(init?.credentials).toBe('include');
    });

    it('sends credentials on the password-recovery endpoints', async () => {
        const { learnerForgotPassword, learnerResetPassword } = await import('./learnerClient');
        await learnerForgotPassword('ada@example.com');
        await learnerResetPassword('reset-token', 'hunter2hunter2');

        for (const [, init] of calls()) {
            expect(init?.credentials).toBe('include');
        }
    });

    it('sends credentials on refresh, authed reads and logout', async () => {
        const mod = await import('./learnerClient');
        mod.setLearnerToken('access-token');

        fetchMock.mockImplementation(async () => jsonResponse({ user: {}, enrollments: [] }));
        await mod.learnerMe();
        await mod.learnerSignOut();

        expect(calls().length).toBeGreaterThanOrEqual(2);
        for (const [, init] of calls()) {
            expect(init?.credentials).toBe('include');
        }
    });

    it('coalesces simultaneous 401s into a single refresh (audit P0-2)', async () => {
        const mod = await import('./learnerClient');
        mod.setLearnerToken('stale-token');

        let refreshCalls = 0;
        fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
            if (url.includes('/learner/refresh')) {
                refreshCalls += 1;
                // Latency keeps every caller in flight at once — without the
                // shared promise each would rotate the cookie separately and the
                // server's reuse detection would nuke the session.
                await new Promise((resolve) => setTimeout(resolve, 10));
                return jsonResponse({ token: 'fresh-token' });
            }
            const auth = (init?.headers as Record<string, string> | undefined)?.Authorization;
            if (auth === 'Bearer stale-token') return jsonResponse({ message: 'expired' }, 401);
            return jsonResponse({ user: {}, enrollments: [] });
        });

        await Promise.all([mod.learnerMe(), mod.learnerMe(), mod.learnerMe()]);

        expect(refreshCalls).toBe(1);
        expect(mod.getLearnerToken()).toBe('fresh-token');
    });

    it('can refresh again later once the in-flight refresh has settled', async () => {
        const mod = await import('./learnerClient');
        mod.setLearnerToken('stale-token');

        let refreshCalls = 0;
        let currentToken = 'stale-token';
        fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
            if (url.includes('/learner/refresh')) {
                refreshCalls += 1;
                currentToken = `fresh-${refreshCalls}`;
                return jsonResponse({ token: currentToken });
            }
            const auth = (init?.headers as Record<string, string> | undefined)?.Authorization;
            if (auth !== `Bearer ${currentToken}` || refreshCalls === 0) {
                return jsonResponse({ message: 'expired' }, 401);
            }
            return jsonResponse({ user: {}, enrollments: [] });
        });

        await mod.learnerMe();
        mod.setLearnerToken('stale-again');
        await mod.learnerMe();

        expect(refreshCalls).toBe(2);
    });

    it('stores the access token returned by sign-in', async () => {
        const mod = await import('./learnerClient');
        await mod.learnerSignIn('ada@example.com', 'hunter2hunter2');
        expect(mod.getLearnerToken()).toBe('tok');
    });
});

/**
 * Audit finding UX-20: OnboardingFlow inlined this request and then redirected
 * unconditionally. `fetch` only rejects on a network failure, so a 401 or a
 * 500 still sent the learner to /learner — where, still not marked onboarded,
 * they were bounced straight back to onboarding. The catch block could never
 * fire for the most likely failures.
 */
describe('learnerCompleteOnboarding', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        const storage = installBrowserGlobals();
        storage.setItem('ykh_learner_token', 'access-token');
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
        vi.restoreAllMocks();
    });

    it('reports ok on success', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
        const { learnerCompleteOnboarding } = await import('./learnerClient');

        expect(await learnerCompleteOnboarding()).toEqual({ ok: true });
    });

    it('reports failure on a 500 instead of looking like success', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ message: 'Database unavailable' }, 500));
        const { learnerCompleteOnboarding } = await import('./learnerClient');

        const result = await learnerCompleteOnboarding();

        expect(result.ok).toBe(false);
        expect(result.message).toBe('Database unavailable');
    });

    it('falls back to a readable message when the body has none', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}, 503));
        const { learnerCompleteOnboarding } = await import('./learnerClient');

        const result = await learnerCompleteOnboarding();

        expect(result.ok).toBe(false);
        expect(result.message).toContain('503');
    });

    it('throws LearnerUnauthorizedError on an unrecoverable 401', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}, 401));
        const { learnerCompleteOnboarding, LearnerUnauthorizedError } = await import('./learnerClient');

        await expect(learnerCompleteOnboarding()).rejects.toBeInstanceOf(LearnerUnauthorizedError);
    });

    it('sends credentials so the refresh cookie travels with it', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
        const { learnerCompleteOnboarding } = await import('./learnerClient');

        await learnerCompleteOnboarding();

        const [, init] = fetchMock.mock.calls[0] as FetchCall;
        expect(init?.credentials).toBe('include');
    });
});
