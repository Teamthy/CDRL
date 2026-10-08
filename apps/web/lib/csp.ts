/**
 * Content-Security-Policy for the site. The policy is built per request so each
 * response carries its own script nonce. It runs in middleware (Edge runtime), so
 * only Web Crypto and string work belong here.
 *
 * The header is Content-Security-Policy-Report-Only: violations are reported and
 * nothing is blocked. Switch CSP_HEADER to 'Content-Security-Policy' once the
 * reports are clean in a real browser.
 */

export const CSP_HEADER = 'Content-Security-Policy-Report-Only';

/** Hosts GA4 needs when NEXT_PUBLIC_GA_ID is set (see components/Analytics.tsx). */
const ANALYTICS_HOSTS = ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'];

/** A fresh 128-bit nonce, base64-encoded. Each response needs its own, unguessable value. */
export function newNonce(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

/** The origin of NEXT_PUBLIC_API_URL, for connect-src. Undefined if unset or not a URL. */
export function apiOriginFrom(apiUrl: string | undefined): string | undefined {
    if (!apiUrl) return undefined;
    try {
        return new URL(apiUrl).origin;
    } catch {
        return undefined;
    }
}

export type CspOptions = {
    isDev: boolean;
    /** Origin the browser calls for data, e.g. https://api.example.com. */
    apiOrigin?: string;
    /** True when GA4 is enabled, which adds its hosts. */
    analytics?: boolean;
};

export function buildContentSecurityPolicy(nonce: string, opts: CspOptions): string {
    const analytics = opts.analytics ? ANALYTICS_HOSTS : [];
    const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(opts.isDev ? ["'unsafe-eval'"] : [])];
    const connectSrc = ["'self'", ...(opts.apiOrigin ? [opts.apiOrigin] : []), ...analytics];
    return [
        "default-src 'self'",
        `script-src ${scriptSrc.join(' ')}`,
        // Next.js and React inject inline styles, so styles keep 'unsafe-inline'.
        "style-src 'self' 'unsafe-inline'",
        ['img-src', "'self'", 'data:', 'blob:', ...analytics].join(' '),
        "font-src 'self'",
        `connect-src ${connectSrc.join(' ')}`,
        // Course player and module text embed YouTube (youtube-nocookie) videos.
        'frame-src https://www.youtube-nocookie.com',
        opts.isDev ? 'frame-ancestors *' : "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');
}
