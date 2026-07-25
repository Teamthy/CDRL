import type { MetadataRoute } from 'next';
import { courses } from '../lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.WEB_URL || 'http://localhost:3000';

const staticRoutes = [
    '/',
    '/about',
    '/training',
    '/corporate-training',
    '/advisory',
    '/research',
    '/events',
    '/partnerships',
    '/leadership',
    '/contact',
    '/learning-plan',
    '/privacy',
    '/terms',
    '/accessibility',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: path === '/' ? 1 : 0.7,
    }));

    const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
        url: `${SITE_URL}/training/${c.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticEntries, ...courseEntries];
}