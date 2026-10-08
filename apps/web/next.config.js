const path = require('path');

/** @type {import('next').NextConfig} */

// `next dev` is routinely viewed through an embedding preview proxy (Codespaces,
// Gitpod, container preview panes). Clickjacking protection is a production
// concern, so it is enforced in production builds and relaxed for dev only —
// the deployed headers are unchanged.
const isDev = process.env.NODE_ENV !== 'production';

// The Content-Security-Policy is built per request in middleware.ts (nonce-based,
// report-only). It is not set here, so there is only one policy in play.

const securityHeaders = [
    ...(isDev ? [] : [{ key: 'X-Frame-Options', value: 'DENY' }]),
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
    reactStrictMode: true,
    // Bundle a minimal server for Docker (see apps/web/Dockerfile).
    output: 'standalone',
    // pnpm monorepo: trace from the workspace root so server node_modules resolve.
    outputFileTracingRoot: path.join(__dirname, '../../'),
    typedRoutes: true,
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    },
    async redirects() {
        return [
            { source: '/leadership', destination: '/about', permanent: true },
            { source: '/trainers', destination: '/training', permanent: true },
            { source: '/trainers/:slug', destination: '/training', permanent: true },
        ];
    },
};

module.exports = nextConfig;
