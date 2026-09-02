'use client';

import { useState } from 'react';
import { Checkbox, Field, Select, TextArea, TextInput } from './fields';

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

// ── Brand-consistent option sets (patch-32 console parity) ───────────────────
const TRACKS = [
    'Information Security',
    'Cybersecurity Management',
    'Technical Cybersecurity',
    'Continuity & Resilience',
    'Privacy & Data Protection',
    'Artificial Intelligence',
    'Digital Transformation',
    'Governance, Risk & Compliance',
    'Quality & Management',
    'Health & Safety',
    'Sustainability',
] as const;
const LEVELS = ['Foundation', 'Professional', 'Advanced', 'Executive'] as const;
const DELIVERY_MODES = [
    'Self-paced',
    'Virtual / Live Online',
    'Virtual / Hybrid',
    'In-person (Lagos)',
    'In-person (Client site)',
] as const;

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
    bandIndividual: string;
    bandCorporate: string;
    bandBundle: string;
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
    bandIndividual: '',
    bandCorporate: '',
    bandBundle: '',
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
    const [slugState, setSlugState] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
    const [slugDebounce, setSlugDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Live slug availability check (patch-32/34): badge under the slug field.
    const checkSlug = (value: string) => {
        if (!value || !isNew) {
            setSlugState('idle');
            return;
        }
        setSlugState('checking');
        if (slugDebounce) clearTimeout(slugDebounce);
        const t = setTimeout(async () => {
            try {
                const { adminFetch, UnauthorizedError } = await import('../../lib/adminClient');
                const data = await adminFetch<{ items?: { slug: string }[] }>(`/admin/courses?limit=200`);
                const taken = (data?.items ?? data as unknown as { slug: string }[])?.some?.((c: { slug: string }) => c.slug === value);
                setSlugState(taken ? 'taken' : 'free');
            } catch (err) {
                // 401 is handled globally by adminFetch; everything else → neutral
                if ((err as Error).name !== 'UnauthorizedError') setSlugState('idle');
            }
        }, 350);
        setSlugDebounce(t);
    };

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
            <Field label="Slug" hint={isNew ? 'Unique; used in the URL /training/<slug>' : 'Locked once published'}>
                <input
                    value={draft.slug}
                    required
                    placeholder="iso-iec-27001-lead-auditor"
                    onChange={(e) => {
                        setDraft({ ...draft, slug: e.target.value, slugTouched: true });
                        checkSlug(e.target.value);
                    }}
                />
                {isNew && (
                    <em className={`admin-field-hint slug-${slugState}`}>
                        {slugState === 'checking' && 'Checking availability…'}
                        {slugState === 'free' && '✓ Available'}
                        {slugState === 'taken' && '✗ Already used by another course'}
                    </em>
                )}
            </Field>
            <TextInput label="Subtitle" value={draft.subtitle} required wide placeholder="e.g. Lead Implementer (PECB Certified)" hint="The credential phrase shown under the title" onChange={(v) => setDraft({ ...draft, subtitle: v })} />
            <Select label="Track" value={draft.track} required placeholder="Choose a PECB category…" options={[...TRACKS]} hint="Drives the /training filter chips" onChange={(v) => setDraft({ ...draft, track: v })} />
            <Select label="Level" value={draft.level} required placeholder="Select level…" options={[...LEVELS]} onChange={(v) => setDraft({ ...draft, level: v })} />
            <Select label="Delivery mode" value={draft.deliveryMode} required placeholder="Pick how the course runs…" options={[...DELIVERY_MODES]} onChange={(v) => setDraft({ ...draft, deliveryMode: v })} />
            <TextInput
                label="Price (₦ — blank = application-based)"
                type="number"
                value={draft.priceNaira}
                placeholder="e.g. 250000"
                onChange={(v) => setDraft({ ...draft, priceNaira: v })}
            />
            <TextInput label="Sort order" type="number" value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
            <Field label="Pricing bands (ROI framing — optional)" wide hint="Shown as the 'Investment' card on the course page">
                <div className="admin-bands">
                    <input
                        value={draft.bandIndividual}
                        placeholder="Self-funded · e.g. ₦250,000 — stretch over two installments"
                        onChange={(e) => setDraft({ ...draft, bandIndividual: e.target.value })}
                    />
                    <input
                        value={draft.bandCorporate}
                        placeholder="Employer/group · e.g. Group of 5+ — ₦… per person"
                        onChange={(e) => setDraft({ ...draft, bandCorporate: e.target.value })}
                    />
                    <input
                        value={draft.bandBundle}
                        placeholder="Bundle note · e.g. Included in the Security Operator pathway"
                        onChange={(e) => setDraft({ ...draft, bandBundle: e.target.value })}
                    />
                </div>
            </Field>
            <TextArea label="Overview" value={draft.overview} required rows={5} placeholder="One sharp sentence on what the participant gets. PECB courses start with: A PECB Certified course delivered by Ykay Consulting Hub." onChange={(v) => setDraft({ ...draft, overview: v })} />
            <TextArea label="Long-form details (markdown-lite — shown on the course page)" value={draft.details} rows={10} hint="Supports ## headings, - bullets, **bold**, [label](url)" placeholder="## About this training

…

## Who should attend

- …" onChange={(v) => setDraft({ ...draft, details: v })} />
            <Checkbox label="Published (visible on the site)" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
        </>
    );
}

// ── Event ───────────────────────────────────────────────────────────────────

export interface EventDraft {
    slug: string;
    eventType: string;
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
    eventType: 'cohort',
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
<Select
                label="Event type"
                value={draft.eventType}
                required
                options={[
                    { value: 'cohort', label: 'Cohort / programme run' },
                    { value: 'exam', label: 'Exam session' },
                    { value: 'webinar', label: 'Webinar' },
                    { value: 'briefing', label: 'Briefing / masterclass' },
                ]}
                hint="Exam sessions list separately on the onboarding pages"
                onChange={(v) => setDraft({ ...draft, eventType: v })}
            />
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
        eventType: d.eventType,
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
    eventType?: string;
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
        eventType: row.eventType ?? 'cohort',
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
