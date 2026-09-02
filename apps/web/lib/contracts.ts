import { z } from 'zod';

/**
 * Shared client/server contract for the CDRL API.
 * The backend (Prisma) is the source of truth for these field names —
 * e.g. `deliveryMode`, NOT the legacy `mode` used by early prototype data.
 */

export const priceBandSchema = z
    .object({
        individual: z.string().optional(),
        corporate: z.string().optional(),
        bundle: z.string().optional(),
    })
    .nullable();

export const trainerSchema = z.object({
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

const bundleCourseSummary = z.object({
    id: z.string().optional(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    track: z.string().optional(),
    level: z.string().optional(),
});

export const bundleCourseSchema = z.object({
    id: z.string().optional(),
    order: z.number().int().optional(),
    course: bundleCourseSummary,
});

export const bundleSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    overview: z.string(),
    details: z.string().nullable().optional(),
    priceBand: priceBandSchema.optional(),
    priceKobo: z.number().int().nullable().optional(),
    currency: z.string().optional(),
    savingsNote: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
    courses: z.array(bundleCourseSchema).optional(),
    courseCount: z.number().int().optional(),
});

export const courseSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    track: z.string(),
    level: z.string(),
    deliveryMode: z.string(),
    overview: z.string(),
    details: z.string().nullable().optional(),
    priceBand: priceBandSchema.optional(),
    priceKobo: z.number().int().nullable().optional(),
    currency: z.string().optional(),
    sortOrder: z.number().int().optional(),
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


export type PriceBand = z.infer<typeof priceBandSchema>;
export type Trainer = z.infer<typeof trainerSchema>;
export type Bundle = z.infer<typeof bundleSchema>;
