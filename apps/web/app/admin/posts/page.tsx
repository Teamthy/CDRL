'use client';

import ResourceManager from '../../../components/admin/ResourceManager';
import {
    PostFields,
    emptyPostDraft,
    postDraftFrom,
    postPayload,
    type PostDraft,
} from '../../../components/admin/editors';
import type { AdminPost } from '../../../lib/adminClient';

export default function PostsAdminPage() {
    return (
        <ResourceManager<AdminPost, PostDraft>
            title="Posts"
            entityName="post"
            description="News, insights and press releases. Public rendering on the News page wires up in Phase C."
            endpoint="/admin/posts"
            columns={['Post', 'Category', 'Published on', 'State']}
            idOf={(p) => p.id}
            emptyDraft={emptyPostDraft}
            draftFrom={postDraftFrom}
            toPayload={postPayload}
            editor={(draft, setDraft, isNew) => <PostFields draft={draft} setDraft={setDraft} isNew={isNew} />}
            renderRow={(p) => (
                <>
                    <span>
                        <strong>{p.title}</strong>
                        <em>{p.slug}</em>
                    </span>
                    <span>{p.category}</span>
                    <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : '—'}</span>
                    <span>
                        <span className={`status-pill ${p.published ? 's-qualified' : 's-new'}`}>
                            {p.published ? 'published' : 'draft'}
                        </span>
                    </span>
                </>
            )}
        />
    );
}
