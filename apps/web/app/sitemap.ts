import type { MetadataRoute } from 'next';
import { getCourses } from '../lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
    '/news',
    '/pecb-signs-partnership-agreement-with-ykay-consulting-hub',
    '/contact',
    '/privacy',
    '/terms',
    '/accessibility',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: 'weekly',
        priority: path === '/' ? 1 : 0.7,
    }));

    let courseEntries: MetadataRoute.Sitemap = [];
    try {
        const courses = await getCourses();
        courseEntries = courses.map((c) => ({
            url: `${SITE_URL}/training/${c.slug}`,
            changeFrequency: 'monthly',
            priority: 0.6,
        }));
    } catch {
        /* courses are additive — never fail the sitemap */
    }

    return [...staticEntries, ...courseEntries];
}
