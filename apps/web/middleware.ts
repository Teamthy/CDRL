import { NextResponse, type NextRequest } from 'next/server';
import { CSP_HEADER, apiOriginFrom, buildContentSecurityPolicy, newNonce } from './lib/csp';

/**
 * Adds a per-request CSP nonce. Next.js applies the nonce to its own inline scripts
 * when it finds the policy on the request, so the policy goes on both the request
 * (for Next) and the response (for the browser).
 *
 * Side effect: a nonce is unique per response, so pages that run this middleware are
 * rendered per request instead of served from the static cache.
 */
export function middleware(request: NextRequest) {
    const nonce = newNonce();
    const policy = buildContentSecurityPolicy(nonce, {
        isDev: process.env.NODE_ENV !== 'production',
        apiOrigin: apiOriginFrom(process.env.NEXT_PUBLIC_API_URL),
        analytics: Boolean(process.env.NEXT_PUBLIC_GA_ID),
    });

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('content-security-policy', policy);
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set(CSP_HEADER, policy);
    return response;
}

export const config = {
    // Static build output and image optimisation do not need a nonce.
    matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico).*)' }],
};
