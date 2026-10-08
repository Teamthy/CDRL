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
