import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitContact } from './contact';

/**
 * Guards the audit fix for "prototype fallback: accept optimistically" —
 * submission failures must NEVER be reported as success again.
 */
describe('submitContact', () => {
    const payload = {
        name: 'Ada',
        email: 'ada@example.com',
        interest: 'Professional Training',
        message: 'Hello CDRL',
    };

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns ok when the API accepts the enquiry', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 201 })));
        const result = await submitContact(payload);
        expect(result.ok).toBe(true);
    });

    it('returns a rate-limit message on HTTP 429', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 429 })));
        const result = await submitContact(payload);
        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/too many attempts/i);
    });

    it('returns ok:false on server errors (no fake success)', async () => {
        for (const status of [400, 500, 503]) {
            vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status })));
            const result = await submitContact(payload);
            expect(result.ok).toBe(false);
        }
    });

    it('returns ok:false when the network is unavailable', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new TypeError('fetch failed');
            }),
        );
        const result = await submitContact(payload);
        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/unable to reach/i);
    });
});
