import type { MetadataRoute } from 'next';

// Revalidate hourly so newly published posts/courses enter the sitemap
// without requiring a redeploy (ISR instead of build-time baking).
export const revalidate = 3600;
import { getCourses, getPublishedPosts } from '../lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const staticRoutes = [
    '/',
    '/about',
    '/training',
    '/trainers',
    '/bundles',
    '/corporate-training',
    '/advisory',
    '/research',
    '/events',
    '/partnerships',
    '/pecb-training-nigeria',
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

    let postEntries: MetadataRoute.Sitemap = [];
    try {
        const posts = await getPublishedPosts();
        postEntries = posts.map((p) => ({
            url: `${SITE_URL}/news/${p.slug}`,
            lastModified: p.publishedAt ?? p.createdAt,
            changeFrequency: 'monthly',
            priority: 0.5,
        }));
    } catch {
        /* posts are additive — never fail the sitemap */
    }

    return [...staticEntries, ...courseEntries, ...postEntries];
}
