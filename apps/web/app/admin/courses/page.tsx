'use client';

import ResourceList from '../../../components/admin/ResourceList';
import type { CourseRow } from '../../../lib/adminClient';

export default function CoursesAdminPage() {
    return (
        <ResourceList<CourseRow>
            title="Courses"
            description="The public catalogue reads from this list — unpublished courses stay hidden."
            endpoint="/admin/courses"
            columns={['Course', 'Track', 'Level', 'State']}
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
