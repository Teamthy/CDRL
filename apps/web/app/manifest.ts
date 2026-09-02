import type { MetadataRoute } from 'next';

/** PWA manifest (patch-25): installable shell; offline handled by public/sw.js. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ykay Consulting Hub — Centre for Digital Risk & Leadership',
        short_name: 'YKAY Consult',
        description: 'Professional training and certification in cybersecurity, AI governance, risk and leadership.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1a10',
        theme_color: '#0b1a10',
        icons: [
            { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
    };
}
