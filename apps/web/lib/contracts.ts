import { z } from 'zod';

/**
 * Shared client/server contract for the CDRL API.
 * The backend (Prisma) is the source of truth for these field names —
 * e.g. `deliveryMode`, NOT the legacy `mode` used by early prototype data.
 */

export const courseSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    track: z.string(),
    level: z.string(),
    deliveryMode: z.string(),
    overview: z.string(),
});

export type Course = z.infer<typeof courseSchema>;

export const editorialBlockSchema = z.object({
    title: z.string(),
    text: z.string(),
    items: z.array(z.string()).optional(),
});

export const pageContentSchema = z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    blocks: z.array(editorialBlockSchema),
});

export type EditorialBlock = z.infer<typeof editorialBlockSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
