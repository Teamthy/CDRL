const path = require('path');

/** @type {import('next').NextConfig} */

// `next dev` is routinely viewed through an embedding preview proxy (Codespaces,
// Gitpod, container preview panes). Clickjacking protection is a production
// concern, so it is enforced in production builds and relaxed for dev only —
// the deployed headers are unchanged.
const isDev = process.env.NODE_ENV !== 'production';

// CSP starts in report-only mode; tighten with a nonce strategy later.
const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : ''),
    isDev ? 'frame-ancestors *' : "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join('; ');

const securityHeaders = [
    ...(isDev ? [] : [{ key: 'X-Frame-Options', value: 'DENY' }]),
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
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
