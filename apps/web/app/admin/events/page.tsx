'use client';

import ResourceManager from '../../../components/admin/ResourceManager';
import {
    EventFields,
    emptyEventDraft,
    eventDraftFrom,
    eventPayload,
    type EventDraft,
} from '../../../components/admin/editors';
import type { AdminEvent } from '../../../lib/adminClient';

export default function EventsAdminPage() {
    return (
        <ResourceManager<AdminEvent, EventDraft>
            title="Events"
            entityName="event"
            description="Programmes, webinars, and cohort dates. Published events will appear on the public Events page (wiring: Phase C)."
            endpoint="/admin/events"
            columns={['Event', 'Starts', 'Location', 'State']}
            idOf={(e) => e.id}
            emptyDraft={emptyEventDraft}
            draftFrom={eventDraftFrom}
            toPayload={eventPayload}
            editor={(draft, setDraft, isNew) => <EventFields draft={draft} setDraft={setDraft} isNew={isNew} />}
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
