import { cache } from 'react';
import { fetchCourse, fetchCourses, fetchPageContent } from './api';
import { courses as localCourses, pageData } from './content';
import type { Course, PageContent } from './contracts';

/**
 * Application data loaders — the single place pages get data from.
 *
 * - React `cache()` dedupes calls within one render pass (so generateMetadata
 *   and the page component no longer perform duplicate fetches).
 * - API-first with a local-content fallback so the site still renders if the
 *   API is unavailable, without masking validation/contract failures.
 */

export const getCourses = cache(async (): Promise<Course[]> => {
    try {
        const remote = await fetchCourses();
        if (remote && remote.length > 0) return remote;
    } catch {
        /* fall through to local content */
    }
    return localCourses;
});

export const getCourseBySlug = cache(async (slug: string): Promise<Course | null> => {
    try {
        const remote = await fetchCourse(slug);
        if (remote) return remote;
    } catch {
        /* fall through to local content */
    }
    return localCourses.find((c) => c.slug === slug) ?? null;
});

export const getPageContent = cache(async (pageKey: string): Promise<PageContent | null> => {
    try {
        const remote = await fetchPageContent(pageKey);
        if (remote) return remote;
    } catch {
        /* fall through to local content */
    }
    return pageData[pageKey] ?? null;
});
