'use client';

import ResourceList from '../../../components/admin/ResourceList';
import type { PostRow } from '../../../lib/adminClient';

export default function PostsAdminPage() {
    return (
        <ResourceList<PostRow>
            title="Posts"
            description="News, insights and press releases. The PECB announcement lives on the public News page."
            endpoint="/admin/posts"
            columns={['Post', 'Category', 'Published', 'State']}
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
