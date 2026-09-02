'use client';

import ResourceList from '../../../components/admin/ResourceList';
import type { EventRow } from '../../../lib/adminClient';

export default function EventsAdminPage() {
    return (
        <ResourceList<EventRow>
            title="Events"
            description="Programmes, webinars, and cohort dates. Published events will appear on the public Events page."
            endpoint="/admin/events"
            columns={['Event', 'Starts', 'Location', 'State']}
            renderRow={(e) => (
                <>
                    <span>
                        <strong>{e.title}</strong>
                        <em>{e.slug}</em>
                    </span>
                    <span>{new Date(e.startsAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span>
                    <span>{e.location ?? '—'}</span>
                    <span>
                        <span className={`status-pill ${e.published ? 's-qualified' : 's-new'}`}>
                            {e.published ? 'published' : 'draft'}
                        </span>
                    </span>
                </>
            )}
        />
    );
}
