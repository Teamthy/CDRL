import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { middleware } from '../middleware';
import { CSP_HEADER, apiOriginFrom, buildContentSecurityPolicy, newNonce } from './csp';

/** Directive name → source list, from a serialised policy. */
function directives(policy: string): Record<string, string[]> {
    return Object.fromEntries(
        policy
            .split(';')
            .map((d) => d.trim())
            .filter(Boolean)
            .map((d) => {
                const [name, ...sources] = d.split(/\s+/);
                return [name, sources];
            }),
    );
}

const prod = { isDev: false };

describe('newNonce', () => {
    it('is base64 of 16 random bytes, and differs on every call', () => {
        const a = newNonce();
        const b = newNonce();
        expect(a).not.toBe(b);
        expect(a).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
        expect(atob(a)).toHaveLength(16);
    });
});

describe('buildContentSecurityPolicy', () => {
    it('allows scripts only with the nonce, never unsafe-inline', () => {
        const d = directives(buildContentSecurityPolicy('n0nce', prod));
        expect(d['script-src']).toEqual(["'self'", "'nonce-n0nce'", "'strict-dynamic'"]);
        expect(d['script-src']).not.toContain("'unsafe-inline'");
    });

    it('allows eval only in development', () => {
        expect(directives(buildContentSecurityPolicy('x', prod))['script-src']).not.toContain("'unsafe-eval'");
        expect(directives(buildContentSecurityPolicy('x', { isDev: true }))['script-src']).toContain("'unsafe-eval'");
    });

    it('forbids framing in production and allows it in development previews', () => {
        expect(directives(buildContentSecurityPolicy('x', prod))['frame-ancestors']).toEqual(["'none'"]);
        expect(directives(buildContentSecurityPolicy('x', { isDev: true }))['frame-ancestors']).toEqual(['*']);
    });

    it('connects to the API origin only when one is configured', () => {
        const withApi = directives(buildContentSecurityPolicy('x', { ...prod, apiOrigin: 'https://api.example.com' }));
        expect(withApi['connect-src']).toEqual(["'self'", 'https://api.example.com']);
        expect(directives(buildContentSecurityPolicy('x', prod))['connect-src']).toEqual(["'self'"]);
    });

    it('adds the analytics hosts only when analytics is on', () => {
        expect(directives(buildContentSecurityPolicy('x', prod))['connect-src']).not.toContain('https://*.google-analytics.com');
        const on = directives(buildContentSecurityPolicy('x', { ...prod, analytics: true }));
        expect(on['connect-src']).toContain('https://*.google-analytics.com');
        expect(on['img-src']).toContain('https://*.google-analytics.com');
    });

    it('allows the YouTube embeds that lessons use', () => {
        expect(directives(buildContentSecurityPolicy('x', prod))['frame-src']).toEqual(['https://www.youtube-nocookie.com']);
    });

    it('keeps images to self, data and blob (no remote images)', () => {
        expect(directives(buildContentSecurityPolicy('x', prod))['img-src']).toEqual(["'self'", 'data:', 'blob:']);
    });
});

describe('apiOriginFrom', () => {
    it('takes the origin of the configured API URL', () => {
        expect(apiOriginFrom('https://api.example.com/api/v1')).toBe('https://api.example.com');
        expect(apiOriginFrom(undefined)).toBeUndefined();
        expect(apiOriginFrom('not a url')).toBeUndefined();
    });
});

describe('middleware', () => {
    it('sends a report-only policy with a fresh nonce on every response', () => {
        const nonceOf = (p: string | null) => /'nonce-([^']+)'/.exec(p ?? '')?.[1];
        const first = middleware(new NextRequest('https://www.example.com/training')).headers.get(CSP_HEADER);
        const second = middleware(new NextRequest('https://www.example.com/training')).headers.get(CSP_HEADER);
        expect(nonceOf(first)).toBeTruthy();
        expect(nonceOf(first)).not.toBe(nonceOf(second));
    });
});
