'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { adminFetch, UnauthorizedError, type ListResponse } from '../../lib/adminClient';

type Props<T> = {
    title: string;
    description: string;
    endpoint: string;
    renderRow: (item: T) => ReactNode;
    columns: string[];
};

/**
 * Read-only listing for a managed collection. Full create/edit/delete
 * editors land in the next console update (Phase B2).
 */
export default function ResourceList<T>({ title, description, endpoint, renderRow, columns }: Props<T>) {
    const [data, setData] = useState<ListResponse<T> | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        adminFetch<ListResponse<T>>(endpoint)
            .then(setData)
            .catch((err) => {
                if (!(err instanceof UnauthorizedError)) setError(err.message);
            });
    }, [endpoint]);

    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <h1>{title}</h1>
                <p className="admin-sub">{description}</p>
            </header>
            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}
            <div className="admin-table">
                <div className="admin-tr admin-th">
                    {columns.map((c) => (
                        <span key={c}>{c}</span>
                    ))}
                </div>
                {data?.items.map((item, i) => (
                    <div className="admin-tr admin-tr-static" key={i}>
                        {renderRow(item)}
                    </div>
                ))}
                {data && data.items.length === 0 && <p className="admin-empty">Nothing here yet.</p>}
            </div>
            <p className="admin-hint">Create / edit / delete controls for {title.toLowerCase()} arrive in the next console update.</p>
        </div>
    );
}
