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

/**
 * The fields a course CARD renders — nothing else (audit P1-8).
 *
 * Course arrays are handed to client components (CourseMarketplace,
 * PecbPortfolioShowcase, FeaturedCertifications…), and every property on them
 * gets serialized into the RSC payload of /, /training and /partnerships. The
 * long-form `details` body and the `overview` paragraph are not rendered by any
 * card, so passing whole rows shipped them to the browser for nothing.
 */
export const courseCardSchema = courseSchema.pick({
    id: true,
    slug: true,
    title: true,
    subtitle: true,
    track: true,
    level: true,
    deliveryMode: true,
});

export type CourseCardView = z.infer<typeof courseCardSchema>;

/** Narrow a full course to the card view model, dropping details/overview. */
export function toCourseCardView(course: Course): CourseCardView {
    return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        track: course.track,
        level: course.level,
        deliveryMode: course.deliveryMode,
    };
}

export const toCourseCardViews = (courses: Course[]): CourseCardView[] => courses.map(toCourseCardView);

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
export type Bundle = z.infer<typeof bundleSchema>;
