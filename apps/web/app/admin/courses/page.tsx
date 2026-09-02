'use client';

import ResourceManager from '../../../components/admin/ResourceManager';
import {
    CourseFields,
    emptyCourseDraft,
    kebab,
    type CourseDraft,
} from '../../../components/admin/editors';
import { adminFetch, type AdminCourse, type ListResponse } from '../../../lib/adminClient';

interface CourseRow extends AdminCourse {
    details?: string | null;
    priceBand?: { individual?: string; corporate?: string; bundle?: string } | null;
}

function draftFrom(c: CourseRow): CourseDraft {
    return {
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        track: c.track,
        level: c.level,
        deliveryMode: c.deliveryMode,
        overview: c.overview,
        details: c.details ?? '',
        priceNaira: c.priceKobo != null ? String(c.priceKobo / 100) : '',
        bandIndividual: c.priceBand?.individual ?? '',
        bandCorporate: c.priceBand?.corporate ?? '',
        bandBundle: c.priceBand?.bundle ?? '',
        currency: c.currency,
        published: c.published,
        sortOrder: String(c.sortOrder),
        slugTouched: true,
    };
}

function toPayload(d: CourseDraft) {
    const priceBand =
        d.bandIndividual.trim() || d.bandCorporate.trim() || d.bandBundle.trim()
            ? {
                  individual: d.bandIndividual.trim() || undefined,
                  corporate: d.bandCorporate.trim() || undefined,
                  bundle: d.bandBundle.trim() || undefined,
              }
            : null;
    return {
        slug: d.slug.trim() || kebab(d.title),
        title: d.title.trim(),
        subtitle: d.subtitle.trim(),
        track: d.track.trim(),
        level: d.level.trim(),
        deliveryMode: d.deliveryMode.trim(),
        overview: d.overview.trim(),
        details: d.details.trim() || null,
        priceBand,
        priceKobo: d.priceNaira ? Math.round(Number(d.priceNaira) * 100) : null,
        currency: d.currency,
        published: d.published,
        sortOrder: Number(d.sortOrder) || 0,
    };
}

export default function AdminCoursesPage() {
    return (
        <ResourceManager<CourseRow, CourseDraft>
            title="Courses"
            description="The full catalogue lives here. PECB-coded courses (with 'PECB' in the subtitle) also appear on the partnerships page."
            endpoint="/admin/courses"
            columns={['Course', 'Track', 'Level', 'Published']}
            idOf={(c) => c.id}
            emptyDraft={emptyCourseDraft}
            draftFrom={draftFrom}
            toPayload={toPayload}
            entityName="course"
            editor={(draft, setDraft, isNew) => <CourseFields draft={draft} setDraft={setDraft} isNew={isNew} />}
            renderRow={(c) => (
                <>
                    <span>
                        <strong>{c.title}</strong> <em className="admin-em">{c.subtitle}</em>
                        <small className="admin-mono">{c.slug}</small>
                    </span>
                    <span>{c.track}</span>
                    <span>{c.level}</span>
                    <span>{c.published ? 'Yes' : 'No'}</span>
                </>
            )}
        />
    );
}
