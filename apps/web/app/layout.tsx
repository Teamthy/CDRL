import type { Metadata, Viewport } from 'next';
import './globals.css';
import JsonLd from '../components/JsonLd';
import { organizationJsonLd, websiteJsonLd } from '../lib/jsonld';
import { DM_Sans, Manrope } from 'next/font/google';

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
});

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
    title: {
        default: 'YKAY Consult | Centre for Digital Risk & Leadership',
        template: '%s | YKAY Consult',
    },
    description:
        'YKAY Consult professional training in cybersecurity, governance, AI risk, and digital leadership certification across Africa.',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: '/' },
    openGraph: {
        title: 'YKAY Consult | Centre for Digital Risk & Leadership',
        description:
            'Professional training in cybersecurity, governance, AI risk, and digital leadership certification across Africa.',
        type: 'website',
        siteName: 'YKAY Consult',
        url: siteUrl,
    },
    icons: {
        icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    },
};

export const viewport: Viewport = {
    themeColor: '#0b1a10',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
            <body>
                <JsonLd data={organizationJsonLd()} />
                <JsonLd data={websiteJsonLd()} />
                <a href="#main-content" className="skip-link">
                    Skip to content
                </a>
                {children}
            </body>
        </html>
    );
}