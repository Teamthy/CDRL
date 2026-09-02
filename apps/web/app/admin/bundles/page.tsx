'use client';

import { useEffect, useState } from 'react';
import ResourceManager from '../../../components/admin/ResourceManager';
import { Field, TextArea, TextInput, Checkbox } from '../../../components/admin/fields';
import { adminFetch, UnauthorizedError, type AdminCourse, type ListResponse } from '../../../lib/adminClient';

interface BundleRow {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    overview: string;
    details: string | null;
    priceKobo: number | null;
    currency: string;
    savingsNote: string | null;
    published: boolean;
    sortOrder: number;
    courses?: { course: { id: string } }[];
}

interface BundleDraft {
    slug: string;
    title: string;
    subtitle: string;
    overview: string;
    details: string;
    priceNaira: string;
    savingsNote: string;
    published: boolean;
    sortOrder: string;
    courseIds: string[];
}

const empty = (): BundleDraft => ({
    slug: '',
    title: '',
    subtitle: '',
    overview: '',
    details: '',
    priceNaira: '',
    savingsNote: '',
    published: true,
    sortOrder: '0',
    courseIds: [],
});

function kebab(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function draftFrom(b: BundleRow & { courses?: { course: { id: string } }[] }): BundleDraft {
    return {
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle,
        overview: b.overview,
        details: b.details ?? '',
        priceNaira: b.priceKobo != null ? String(b.priceKobo / 100) : '',
        savingsNote: b.savingsNote ?? '',
        published: b.published,
        sortOrder: String(b.sortOrder),
        courseIds: (b.courses ?? []).map((bc) => bc.course.id),
    };
}

function toPayload(d: BundleDraft) {
    return {
        slug: d.slug.trim() || kebab(d.title),
        title: d.title.trim(),
        subtitle: d.subtitle.trim(),
        overview: d.overview.trim(),
        details: d.details.trim() || null,
        priceKobo: d.priceNaira ? Math.round(Number(d.priceNaira) * 100) : null,
        currency: 'NGN',
        savingsNote: d.savingsNote.trim() || null,
        published: d.published,
        sortOrder: Number(d.sortOrder) || 0,
        courseIds: d.courseIds,
    };
}

function BundleEditor({
    draft,
    setDraft,
}: {
    draft: BundleDraft;
    setDraft: (d: BundleDraft) => void;
}) {
    const [courses, setCourses] = useState<AdminCourse[]>([]);
    useEffect(() => {
        adminFetch<ListResponse<AdminCourse>>('/admin/courses?limit=200')
            .then((d) => setCourses(d.items))
            .catch((err) => {
                if (!(err instanceof UnauthorizedError)) console.error(err);
            });
    }, []);
    const toggle = (id: string) =>
        setDraft({
            ...draft,
            courseIds: draft.courseIds.includes(id) ? draft.courseIds.filter((c) => c !== id) : [...draft.courseIds, id],
        });
    return (
        <>
            <TextInput label="Bundle title" value={draft.title} required placeholder="Security Operator Pathway" onChange={(v) => setDraft({ ...draft, title: v })} />
            <TextInput label="Slug" value={draft.slug} required placeholder="security-operator-pathway" onChange={(v) => setDraft({ ...draft, slug: v })} />
            <TextInput label="Tagline" value={draft.subtitle} required wide placeholder="Three programmes · one pathway" onChange={(v) => setDraft({ ...draft, subtitle: v })} />
            <TextArea label="Overview" value={draft.overview} required rows={3} placeholder="Stack three PECB credentials toward an operational security role." onChange={(v) => setDraft({ ...draft, overview: v })} />
            <TextArea label="Long-form details (markdown-lite)" value={draft.details} rows={6} onChange={(v) => setDraft({ ...draft, details: v })} />
            <TextInput label="Bundle price (₦ — blank = request quote)" type="number" value={draft.priceNaira} placeholder="e.g. 600000" onChange={(v) => setDraft({ ...draft, priceNaira: v })} />
            <TextInput label="Savings note (optional)" value={draft.savingsNote} placeholder="Save ₦120,000 vs separate enrolments" onChange={(v) => setDraft({ ...draft, savingsNote: v })} />
            <TextInput label="Sort order" type="number" value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
            <Field label="Courses in this bundle" wide hint="Order = the order they render in the pathway">
                <div className="bundle-course-picker">
                    {courses.length === 0 && <small>Loading courses…</small>}
                    {courses.map((c) => (
                        <label key={c.id} className="bundle-course-opt">
                            <input type="checkbox" checked={draft.courseIds.includes(c.id)} onChange={() => toggle(c.id)} />
                            <span>
                                <strong>{c.title}</strong> <em>{c.subtitle}</em>
                                <small>{c.track}</small>
                            </span>
                        </label>
                    ))}
                </div>
            </Field>
            <Checkbox label="Published (visible on /bundles)" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
        </>
    );
}

export default function BundlesAdminPage() {
    return (
        <ResourceManager<BundleRow, BundleDraft>
            title="Bundles"
            description="Multi-course pathway packages — Train & Certify style offers at /bundles."
            endpoint="/admin/bundles"
            columns={['Bundle', 'Courses', 'Price', 'Published']}
            idOf={(b) => b.id}
            emptyDraft={empty}
            draftFrom={draftFrom}
            toPayload={toPayload}
            entityName="bundle"
            editor={(draft, setDraft) => <BundleEditor draft={draft} setDraft={setDraft} />}
            renderRow={(b) => (
                <>
                    <span>
                        <strong>{b.title}</strong>
                        <small className="admin-mono">{b.slug}</small>
                    </span>
                    <span>{b.courses?.length ?? 0}</span>
                    <span>{b.priceKobo ? `₦${(b.priceKobo / 100).toLocaleString('en-NG')}` : 'Quote'}</span>
                    <span>{b.published ? 'Yes' : 'No'}</span>
                </>
            )}
        />
    );
}
