import { z } from 'zod';
import { courseSchema, pageContentSchema, type Course, type PageContent } from './contracts';

/**
 * Low-level API client. Every response is validated at the boundary so a
 * backend contract drift becomes a loud fallback (to local content) instead
 * of silently rendering `undefined` — this is what caught the old
 * `mode` vs `deliveryMode` mismatch unguarded.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** ISR: revalidate periodically so pages can be statically generated and
 *  cached instead of SSR-per-request (the old `cache: 'no-store'` nullified
 *  the route-level `revalidate` exports). */
const FETCH_INIT = { next: { revalidate: 1800, tags: ['cdrl-content'] } };

export async function fetchCourses(search?: string, track?: string): Promise<Course[] | null> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (track) params.set('track', track);
    const url = `${API_BASE}/courses${params.size ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, FETCH_INIT);
    if (!res.ok) return null;
    const parsed = z.array(courseSchema).safeParse(await res.json());
    return parsed.success ? parsed.data : null;
}

export async function fetchCourse(slug: string): Promise<Course | null> {
    const res = await fetch(`${API_BASE}/courses/${encodeURIComponent(slug)}`, FETCH_INIT);
    if (!res.ok) return null;
    const parsed = courseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
}

export async function fetchPageContent(page: string): Promise<PageContent | null> {
    const res = await fetch(`${API_BASE}/content/${encodeURIComponent(page)}`, FETCH_INIT);
    if (!res.ok) return null;
    const parsed = pageContentSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
}

export default API_BASE;
