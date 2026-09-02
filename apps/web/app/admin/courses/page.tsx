'use client';

import ResourceManager from '../../../components/admin/ResourceManager';
import {
    CourseFields,
    coursePayload,
    emptyCourseDraft,
    type CourseDraft,
} from '../../../components/admin/editors';
import type { AdminCourse } from '../../../lib/adminClient';

export default function CoursesAdminPage() {
    return (
        <ResourceManager<AdminCourse, CourseDraft>
            title="Courses"
            entityName="course"
            description="The public catalogue reads from this list — unpublished courses stay hidden."
            endpoint="/admin/courses"
            columns={['Course', 'Track', 'Level', 'State']}
            idOf={(c) => c.id}
            emptyDraft={emptyCourseDraft}
            draftFrom={(c) => ({
                slug: c.slug,
                title: c.title,
                subtitle: c.subtitle,
                track: c.track,
                level: c.level,
                deliveryMode: c.deliveryMode,
                overview: c.overview,
                published: c.published,
                sortOrder: String(c.sortOrder),
                slugTouched: true,
            })}
            toPayload={coursePayload}
            editor={(draft, setDraft, isNew) => <CourseFields draft={draft} setDraft={setDraft} isNew={isNew} />}
            renderRow={(c) => (
                <>
                    <span>
                        <strong>{c.title}</strong>
                        <em>{c.slug}</em>
                    </span>
                    <span>{c.track}</span>
                    <span>{c.level}</span>
                    <span>
                        <span className={`status-pill ${c.published ? 's-qualified' : 's-closed'}`}>
                            {c.published ? 'published' : 'hidden'}
                        </span>
                    </span>
                </>
            )}
        />
    );
}
