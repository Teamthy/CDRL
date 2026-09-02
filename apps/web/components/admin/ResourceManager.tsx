'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { adminFetch, UnauthorizedError, type ListResponse } from '../../lib/adminClient';

/** Two-click delete: first tap arm it, second confirms. */
function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
    const [armed, setArmed] = useState(false);
    useEffect(() => {
        if (!armed) return;
        const t = setTimeout(() => setArmed(false), 3000);
        return () => clearTimeout(t);
    }, [armed]);
    return (
        <button
            type="button"
            className={`admin-icon-btn danger ${armed ? 'armed' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                if (armed) onConfirm();
                else setArmed(true);
            }}
        >
            <Trash2 />
            {armed ? ' Confirm?' : ''}
        </button>
    );
}

type ManagerProps<T, D> = {
    title: string;
    description: string;
    endpoint: string;
    columns: string[];
    renderRow: (item: T) => ReactNode;
    idOf: (item: T) => string;
    emptyDraft: () => D;
    draftFrom: (item: T) => D;
    toPayload: (draft: D) => Record<string, unknown>;
    editor: (draft: D, setDraft: (d: D) => void, isNew: boolean) => ReactNode;
    entityName: string;
};

/**
 * List + create + edit + delete for a managed collection.
 * One editor panel at the top; two-click delete guards accidents.
 */
export default function ResourceManager<T, D>({
    title,
    description,
    endpoint,
    columns,
    renderRow,
    idOf,
    emptyDraft,
    draftFrom,
    toPayload,
    editor,
    entityName,
}: ManagerProps<T, D>) {
    const [data, setData] = useState<ListResponse<T> | null>(null);
    const [editing, setEditing] = useState<{ id: string | null; draft: D } | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setError(null);
        try {
            setData(await adminFetch<ListResponse<T>>(`${endpoint}?limit=100`));
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, [endpoint]);

    useEffect(() => {
        void reload();
    }, [reload]);

    async function save() {
        if (!editing) return;
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            const payload = toPayload(editing.draft);
            if (editing.id) {
                await adminFetch(`${endpoint}/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
                setNotice(`${entityName} updated.`);
            } else {
                await adminFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
                setNotice(`${entityName} created.`);
            }
            setEditing(null);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    async function remove(id: string) {
        try {
            await adminFetch(`${endpoint}/${id}`, { method: 'DELETE' });
            setNotice(`${entityName} deleted.`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    return (
        <div className="admin-page">
            <header className="admin-page-head admin-crud-head">
                <div>
                    <h1>{title}</h1>
                    <p className="admin-sub">{description}</p>
                </div>
                <button type="button" className="admin-save" onClick={() => setEditing({ id: null, draft: emptyDraft() })}>
                    <Plus /> New {entityName}
                </button>
            </header>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {notice && <p className="admin-notice" role="status">{notice}</p>}

            {editing && (
                <section className="admin-editor-panel">
                    <div className="admin-editor-head">
                        <h2>{editing.id ? `Edit ${entityName}` : `New ${entityName}`}</h2>
                        <button type="button" className="admin-icon-btn" onClick={() => setEditing(null)} aria-label="Cancel">
                            <X />
                        </button>
                    </div>
                    <form
                        className="admin-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void save();
                        }}
                    >
                        {editor(editing.draft, (d) => setEditing({ ...editing, draft: d }), !editing.id)}
                        <div className="admin-form-actions">
                            <button type="submit" className="admin-save" disabled={busy}>
                                {busy ? 'Saving…' : editing.id ? 'Save changes' : `Create ${entityName}`}
                            </button>
                            <button type="button" className="admin-ghost" onClick={() => setEditing(null)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <div className="admin-table">
                <div className="admin-tr admin-th admin-tr-crud">
                    {columns.map((c) => (
                        <span key={c}>{c}</span>
                    ))}
                    <span aria-hidden="true" />
                </div>
                {data?.items.map((item) => {
                    const id = idOf(item);
                    return (
                        <div className="admin-tr admin-tr-static admin-tr-crud" key={id}>
                            {renderRow(item)}
                            <span className="admin-row-actions">
                                <button
                                    type="button"
                                    className="admin-icon-btn"
                                    onClick={() => setEditing({ id, draft: draftFrom(item) })}
                                    aria-label={`Edit ${entityName}`}
                                >
                                    <Pencil />
                                </button>
                                <DeleteButton onConfirm={() => void remove(id)} />
                            </span>
                        </div>
                    );
                })}
                {data && data.items.length === 0 && (
                    <p className="admin-empty">None yet — use “New {entityName}” above.</p>
                )}
            </div>
        </div>
    );
}
