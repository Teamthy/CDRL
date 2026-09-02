'use client';

import { Checkbox, TextArea, TextInput } from './fields';

/** kebab-case helper for slugs (runs while the slug field is untouched). */
export function kebab(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function isoToInput(iso: string | null | undefined): string {
    if (!iso) return '';
    return iso.slice(0, 16);
}

// ── Course ──────────────────────────────────────────────────────────────────

export interface CourseDraft {
    slug: string;
    title: string;
    subtitle: string;
    track: string;
    level: string;
    deliveryMode: string;
    overview: string;
    details: string;
    priceNaira: string;
    currency: string;
    published: boolean;
    sortOrder: string;
    slugTouched: boolean;
}

export const emptyCourseDraft = (): CourseDraft => ({
    slug: '',
    title: '',
    subtitle: '',
    track: '',
    level: '',
    deliveryMode: 'Self-paced',
    overview: '',
    details: '',
    priceNaira: '',
    currency: 'NGN',
    published: true,
    sortOrder: '0',
    slugTouched: false,
});

export function CourseFields({
    draft,
    setDraft,
    isNew,
}: {
    draft: CourseDraft;
    setDraft: (d: CourseDraft) => void;
    isNew: boolean;
}) {
    return (
        <>
            <TextInput
                label="Title"
                value={draft.title}
                required
                onChange={(v) =>
                    setDraft({
                        ...draft,
                        title: v,
                        slug: isNew && !draft.slugTouched ? kebab(v) : draft.slug,
                    })
                }
            />
            <TextInput
                label="Slug"
                value={draft.slug}
                required
                placeholder="iso-iec-27001-lead-auditor"
                onChange={(v) => setDraft({ ...draft, slug: v, slugTouched: true })}
            />
            <TextInput label="Subtitle" value={draft.subtitle} required wide onChange={(v) => setDraft({ ...draft, subtitle: v })} />
            <TextInput label="Track (e.g. Cybersecurity, GRC)" value={draft.track} required onChange={(v) => setDraft({ ...draft, track: v })} />
            <TextInput label="Level (e.g. Foundation)" value={draft.level} required onChange={(v) => setDraft({ ...draft, level: v })} />
            <TextInput label="Delivery mode" value={draft.deliveryMode} required onChange={(v) => setDraft({ ...draft, deliveryMode: v })} />
            <TextInput
                label="Price (₦ — blank = application-based)"
                type="number"
                value={draft.priceNaira}
                placeholder="e.g. 250000"
                onChange={(v) => setDraft({ ...draft, priceNaira: v })}
            />
            <TextInput label="Sort order" type="number" value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
            <TextArea label="Overview" value={draft.overview} required rows={5} onChange={(v) => setDraft({ ...draft, overview: v })} />
            <TextArea label="Long-form details (markdown-lite — shown on the course page)" value={draft.details} rows={10} onChange={(v) => setDraft({ ...draft, details: v })} />
            <Checkbox label="Published (visible on the site)" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
        </>
    );
}

// ── Event ───────────────────────────────────────────────────────────────────

export interface EventDraft {
    slug: string;
    title: string;
    summary: string;
    body: string;
    location: string;
    startsAt: string;
    endsAt: string;
    registrationUrl: string;
    published: boolean;
    slugTouched: boolean;
}

export const emptyEventDraft = (): EventDraft => ({
    slug: '',
    title: '',
    summary: '',
    body: '',
    location: '',
    startsAt: '',
    endsAt: '',
    registrationUrl: '',
    published: false,
    slugTouched: false,
});

export function EventFields({
    draft,
    setDraft,
    isNew,
}: {
    draft: EventDraft;
    setDraft: (d: EventDraft) => void;
    isNew: boolean;
}) {
    return (
        <>
            <TextInput
                label="Title"
                value={draft.title}
                required
                onChange={(v) =>
                    setDraft({ ...draft, title: v, slug: isNew && !draft.slugTouched ? kebab(v) : draft.slug })
                }
            />
            <TextInput label="Slug" value={draft.slug} required onChange={(v) => setDraft({ ...draft, slug: v, slugTouched: true })} />
            <TextInput label="Starts" type="datetime-local" value={draft.startsAt} required onChange={(v) => setDraft({ ...draft, startsAt: v })} />
            <TextInput label="Ends (optional)" type="datetime-local" value={draft.endsAt} onChange={(v) => setDraft({ ...draft, endsAt: v })} />
            <TextInput label="Location (optional)" value={draft.location} placeholder="Lagos / Online" onChange={(v) => setDraft({ ...draft, location: v })} />
            <TextInput label="Registration link (optional)" type="url" value={draft.registrationUrl} onChange={(v) => setDraft({ ...draft, registrationUrl: v })} />
            <TextArea label="Summary" value={draft.summary} required rows={3} onChange={(v) => setDraft({ ...draft, summary: v })} />
            <TextArea label="Body (optional, longer detail)" value={draft.body} rows={6} onChange={(v) => setDraft({ ...draft, body: v })} />
            <Checkbox label="Published" hint="Drafts stay hidden from the public site" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
        </>
    );
}

// ── Post ────────────────────────────────────────────────────────────────────

export interface PostDraft {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    body: string;
    coverImageUrl: string;
    publishedAt: string;
    published: boolean;
    slugTouched: boolean;
}

export const emptyPostDraft = (): PostDraft => ({
    slug: '',
    title: '',
    category: 'NEWS',
    excerpt: '',
    body: '',
    coverImageUrl: '',
    publishedAt: '',
    published: false,
    slugTouched: false,
});

export function PostFields({
    draft,
    setDraft,
    isNew,
}: {
    draft: PostDraft;
    setDraft: (d: PostDraft) => void;
    isNew: boolean;
}) {
    return (
        <>
            <TextInput
                label="Title"
                value={draft.title}
                required
                onChange={(v) =>
                    setDraft({ ...draft, title: v, slug: isNew && !draft.slugTouched ? kebab(v) : draft.slug })
                }
            />
            <TextInput label="Slug" value={draft.slug} required onChange={(v) => setDraft({ ...draft, slug: v, slugTouched: true })} />
            <TextInput label="Category (e.g. NEWS, AI GOVERNANCE)" value={draft.category} required onChange={(v) => setDraft({ ...draft, category: v })} />
            <TextInput label="Publish date (optional)" type="datetime-local" value={draft.publishedAt} onChange={(v) => setDraft({ ...draft, publishedAt: v })} />
            <TextInput label="Cover image URL (optional)" type="url" value={draft.coverImageUrl} onChange={(v) => setDraft({ ...draft, coverImageUrl: v })} />
            <TextArea label="Excerpt" value={draft.excerpt} required rows={2} onChange={(v) => setDraft({ ...draft, excerpt: v })} />
            <TextArea label="Body" value={draft.body} required rows={10} onChange={(v) => setDraft({ ...draft, body: v })} />
            <Checkbox label="Published" hint="Drafts stay hidden from the public site" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
        </>
    );
}

// ── Shared payload converters ───────────────────────────────────────────────

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim());
const toIsoOrNull = (v: string) => (v ? new Date(v).toISOString() : null);

export function coursePayload(d: CourseDraft) {
    const naira = Number.parseFloat(d.priceNaira);
    return {
        slug: d.slug.trim(),
        title: d.title.trim(),
        subtitle: d.subtitle.trim(),
        track: d.track.trim(),
        level: d.level.trim(),
        deliveryMode: d.deliveryMode.trim(),
        overview: d.overview.trim(),
        details: d.details.trim() || null,
        priceKobo: Number.isFinite(naira) && naira > 0 ? Math.round(naira * 100) : null,
        currency: d.currency || 'NGN',
        published: d.published,
        sortOrder: Number.parseInt(d.sortOrder, 10) || 0,
    };
}

export function eventPayload(d: EventDraft) {
    return {
        slug: d.slug.trim(),
        title: d.title.trim(),
        summary: d.summary.trim(),
        body: nullIfEmpty(d.body),
        location: nullIfEmpty(d.location),
        startsAt: new Date(d.startsAt).toISOString(),
        endsAt: toIsoOrNull(d.endsAt),
        registrationUrl: nullIfEmpty(d.registrationUrl),
        published: d.published,
    };
}

export function postPayload(d: PostDraft) {
    return {
        slug: d.slug.trim(),
        title: d.title.trim(),
        category: d.category.trim(),
        excerpt: d.excerpt.trim(),
        body: d.body,
        coverImageUrl: nullIfEmpty(d.coverImageUrl),
        publishedAt: toIsoOrNull(d.publishedAt),
        published: d.published,
    };
}

export function eventDraftFrom(row: {
    slug: string;
    title: string;
    summary: string;
    body: string | null;
    location: string | null;
    startsAt: string;
    endsAt: string | null;
    registrationUrl: string | null;
    published: boolean;
}): EventDraft {
    return {
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        body: row.body ?? '',
        location: row.location ?? '',
        startsAt: isoToInput(row.startsAt),
        endsAt: isoToInput(row.endsAt),
        registrationUrl: row.registrationUrl ?? '',
        published: row.published,
        slugTouched: true,
    };
}

export function postDraftFrom(row: {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    body: string;
    coverImageUrl: string | null;
    publishedAt: string | null;
    published: boolean;
}): PostDraft {
    return {
        slug: row.slug,
        title: row.title,
        category: row.category,
        excerpt: row.excerpt,
        body: row.body,
        coverImageUrl: row.coverImageUrl ?? '',
        publishedAt: isoToInput(row.publishedAt),
        published: row.published,
        slugTouched: true,
    };
}
