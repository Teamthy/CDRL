import { z } from 'zod';
import { courseSchema, pageContentSchema, type Course, type PageContent } from './contracts';

// Public events & posts (patch-15/16): plain row arrays from the API.
const publicEventSchema = z.object({
    eventType: z.enum(['cohort', 'exam', 'webinar', 'briefing']).optional(),
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    body: z.string().nullable(),
    location: z.string().nullable(),
    startsAt: z.string(),
    endsAt: z.string().nullable(),
    registrationUrl: z.string().nullable(),
});

const publicPostListItemSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    excerpt: z.string(),
    coverImageUrl: z.string().nullable(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
});

const publicPostSchema = publicPostListItemSchema.extend({ body: z.string() });

export type PublicEvent = z.infer<typeof publicEventSchema>;
export type PublicPostListItem = z.infer<typeof publicPostListItemSchema>;
export type PublicPost = z.infer<typeof publicPostSchema>;

/**
 * Low-level API client. Every response is validated at the boundary so a
 * backend contract drift becomes a loud fallback (to local content) instead
 * of silently rendering `undefined` — this is what caught the old
 * `mode` vs `deliveryMode` mismatch unguarded.
 */

// Server-side fetches can target an internal address (e.g. the api service
// name inside a container network); the browser always uses the public URL.
const API_BASE =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';

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

export async function fetchEvents(): Promise<PublicEvent[] | null> {
    const res = await fetch(`${API_BASE}/events`, FETCH_INIT);
    if (!res.ok) return null;
    const parsed = z.array(publicEventSchema).safeParse(await res.json());
    return parsed.success ? parsed.data : null;
}

export async function fetchPosts(): Promise<PublicPostListItem[] | null> {
    const res = await fetch(`${API_BASE}/posts`, FETCH_INIT);
    if (!res.ok) return null;
    const parsed = z.array(publicPostListItemSchema).safeParse(await res.json());
    return parsed.success ? parsed.data : null;
}

export async function fetchPostBySlug(slug: string): Promise<PublicPost | null> {
    const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, FETCH_INIT);
    if (!res.ok) return null;
    const parsed = publicPostSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
}

export default API_BASE;


// ── patch-33: trainers & bundles (public) ───────────────────────────────────

const publicTrainerSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    focus: z.string(),
    photoUrl: z.string().nullable().optional(),
    linkedIn: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
    courses: z
        .array(
            z.object({
                role: z.string().optional(),
                course: z.object({
                    id: z.string().optional(),
                    slug: z.string(),
                    title: z.string(),
                    subtitle: z.string().optional(),
                    track: z.string().optional(),
                    level: z.string().optional(),
                }),
            }),
        )
        .optional(),
});
export type PublicTrainer = z.infer<typeof publicTrainerSchema>;

const publicBundleSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    overview: z.string(),
    details: z.string().nullable().optional(),
    priceKobo: z.number().int().nullable().optional(),
    currency: z.string().optional(),
    savingsNote: z.string().nullable().optional(),
    courseCount: z.number().int().optional(),
    courses: z
        .array(
            z.object({
                order: z.number().int().optional(),
                course: z.object({
                    id: z.string().optional(),
                    slug: z.string(),
                    title: z.string(),
                    subtitle: z.string().optional(),
                }),
            }),
        )
        .optional(),
});
export type PublicBundle = z.infer<typeof publicBundleSchema>;

export async function fetchTrainers(): Promise<PublicTrainer[] | null> {
    try {
        const res = await fetch(`${API_BASE}/trainers`, FETCH_INIT);
        if (!res.ok) return null;
        const parsed = z.array(publicTrainerSchema).safeParse(await res.json());
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export async function fetchTrainer(slug: string): Promise<PublicTrainer | null> {
    try {
        const res = await fetch(`${API_BASE}/trainers/${slug}`, FETCH_INIT);
        if (!res.ok) return null;
        const parsed = publicTrainerSchema.safeParse(await res.json());
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export async function fetchBundles(): Promise<PublicBundle[] | null> {
    try {
        const res = await fetch(`${API_BASE}/bundles`, FETCH_INIT);
        if (!res.ok) return null;
        const parsed = z.array(publicBundleSchema).safeParse(await res.json());
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export async function fetchBundle(slug: string): Promise<PublicBundle | null> {
    try {
        const res = await fetch(`${API_BASE}/bundles/${slug}`, FETCH_INIT);
        if (!res.ok) return null;
        const parsed = publicBundleSchema.safeParse(await res.json());
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}
