'use client';

import ResourceManager from '../../../components/admin/ResourceManager';
import { Field, TextArea, TextInput, Checkbox } from '../../../components/admin/fields';
import type { ListResponse } from '../../../lib/adminClient';

interface TrainerRow {
    id: string;
    slug: string;
    name: string;
    title: string;
    bio: string;
    focus: string;
    photoUrl: string | null;
    linkedIn: string | null;
    published: boolean;
    sortOrder: number;
}

interface TrainerDraft {
    slug: string;
    name: string;
    title: string;
    bio: string;
    focus: string;
    photoUrl: string;
    linkedIn: string;
    published: boolean;
    sortOrder: string;
}

const empty = (): TrainerDraft => ({
    slug: '',
    name: '',
    title: '',
    bio: '',
    focus: '',
    photoUrl: '',
    linkedIn: '',
    published: true,
    sortOrder: '0',
});

function draftFrom(t: TrainerRow): TrainerDraft {
    return {
        slug: t.slug,
        name: t.name,
        title: t.title,
        bio: t.bio,
        focus: t.focus,
        photoUrl: t.photoUrl ?? '',
        linkedIn: t.linkedIn ?? '',
        published: t.published,
        sortOrder: String(t.sortOrder),
    };
}

function toPayload(d: TrainerDraft) {
    const kebab = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return {
        slug: d.slug.trim() || kebab(d.name),
        name: d.name.trim(),
        title: d.title.trim(),
        bio: d.bio.trim(),
        focus: d.focus.trim(),
        photoUrl: d.photoUrl.trim() || null,
        linkedIn: d.linkedIn.trim() || null,
        published: d.published,
        sortOrder: Number(d.sortOrder) || 0,
    };
}

export default function TrainersAdminPage() {
    return (
        <ResourceManager<TrainerRow, TrainerDraft>
            title="Trainers"
            description="Faculty profiles — public at /trainers, with per-person course-taught sub-pages."
            endpoint="/admin/trainers"
            columns={['Trainer', 'Title', 'Focus', 'Published']}
            idOf={(t) => t.id}
            emptyDraft={empty}
            draftFrom={draftFrom}
            toPayload={toPayload}
            entityName="trainer"
            editor={(draft, setDraft) => (
                <>
                    <TextInput label="Full name" value={draft.name} required placeholder="Adaeze Okafor" onChange={(v) => setDraft({ ...draft, name: v })} />
                    <TextInput label="Slug" value={draft.slug} required hint="Lowercase-hyphenated; auto-suggested from name if left matching" placeholder="adaeze-okafor" onChange={(v) => setDraft({ ...draft, slug: v })} />
                    <TextInput
                        label="Credential title"
                        value={draft.title}
                        required
                        wide
                        placeholder="Lead Auditor · Information Security"
                        hint="Shown under the name — the PECB/ISO credentials to surface first"
                        onChange={(v) => setDraft({ ...draft, title: v })}
                    />
                    <TextInput
                        label="Focus areas"
                        value={draft.focus}
                        required
                        wide
                        placeholder="ISO/IEC 27001 · ISO 22301 · Cloud Security"
                        hint="Tags used on the trainer card"
                        onChange={(v) => setDraft({ ...draft, focus: v })}
                    />
                    <TextArea
                        label="Short bio"
                        value={draft.bio}
                        required
                        rows={5}
                        placeholder="Two to three sentences on practice + teaching style."
                        onChange={(v) => setDraft({ ...draft, bio: v })}
                    />
                    <TextInput label="Photo URL (optional)" type="url" value={draft.photoUrl} placeholder="https://…" onChange={(v) => setDraft({ ...draft, photoUrl: v })} />
                    <TextInput label="LinkedIn (optional)" type="url" value={draft.linkedIn} placeholder="https://linkedin.com/in/…" onChange={(v) => setDraft({ ...draft, linkedIn: v })} />
                    <TextInput label="Sort order" type="number" value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
                    <Checkbox label="Published on /trainers" checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
                </>
            )}
            renderRow={(t) => (
                <>
                    <span>
                        <strong>{t.name}</strong>
                        <small className="admin-mono">{t.slug}</small>
                    </span>
                    <span>{t.title}</span>
                    <span>{t.focus}</span>
                    <span>{t.published ? 'Yes' : 'No'}</span>
                </>
            )}
        />
    );
}
