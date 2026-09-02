'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ListChecks, Pencil, Plus, Search, Trash2, X, Eye } from 'lucide-react';
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
    /** Optional bulk-publish toggle field name (when records carry `published`). */
    bulkPublish?: boolean;
    /** Optional in-editor preview URL builder (e.g. course page). */
    previewUrlOf?: (draft: D) => string | null;
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
    bulkPublish = false,
    previewUrlOf,
}: ManagerProps<T, D>) {
    const [data, setData] = useState<ListResponse<T> | null>(null);
    const [editing, setEditing] = useState<{ id: string | null; draft: D } | null>(null);
    const draftsKey = `admin-draft:${endpoint}`;
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // Notices self-clear so stale confirmations never linger.
    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(null), 4500);
        return () => clearTimeout(t);
    }, [notice]);

    const tryCloseEditor = useCallback(() => {
        setEditing((cur) => {
            if (!cur) return cur;
            // Any non-empty text content counts as dirty input.
            const dirty = Object.values(cur.draft as Record<string, unknown>).some(
                (v) => typeof v === 'string' && v.trim().length > 0,
            );
            if (!dirty || window.confirm('Discard the unsaved changes to this draft?')) return null;
            return cur;
        });
    }, []);

    // Escape everywhere closes the editor panel (with the same dirty guard).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') tryCloseEditor();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [tryCloseEditor]);

    const reload = useCallback(async () => {
        setError(null);
        try {
            setData(await adminFetch<ListResponse<T>>(`${endpoint}?limit=200`));
            setSelected(new Set());
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, [endpoint]);

    async function bulkSetPublished(value: boolean) {
        if (selected.size === 0) return;
        if (!window.confirm(`${value ? 'Publish' : 'Unpublish'} ${selected.size} ${entityName}(s)?`)) return;
        setBusy(true);
        setError(null);
        try {
            for (const id of selected) {
                await adminFetch(`${endpoint}/${id}`, { method: 'PATCH', body: JSON.stringify({ published: value }) });
            }
            setNotice(`${selected.size} ${entityName}${selected.size > 1 ? 's' : ''} ${value ? 'published' : 'unpublished'}.`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        void reload();
    }, [reload]);

    // ── Autosave drafts (localStorage) ────────────────────────────────────────
    // Any in-progress editor state is snapshotted on every keystroke; on mount
    // after a crash/reload we offer a restore.
    const [restorableDraft, setRestorableDraft] = useState<{ id: string | null; draft: D } | null>(null);
    useEffect(() => {
        try {
            const raw = localStorage.getItem(draftsKey);
            if (raw) setRestorableDraft(JSON.parse(raw) as { id: string | null; draft: D });
        } catch { /* corrupted draft -> ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftsKey]);
    useEffect(() => {
        try {
            if (editing) localStorage.setItem(draftsKey, JSON.stringify(editing));
            else localStorage.removeItem(draftsKey);
        } catch { /* storage full / private mode — non-fatal */ }
    }, [editing, draftsKey]);

    const restoreDraft = () => {
        if (restorableDraft) setEditing(restorableDraft);
        setRestorableDraft(null);
    };
    const dismissDraft = () => {
        try { localStorage.removeItem(draftsKey); } catch { /* ignore */ }
        setRestorableDraft(null);
    };

    // ── Bulk selection ────────────────────────────────────────────────────────
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const toggleSelect = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

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
            {restorableDraft && !editing && (
                <div className="admin-restore" role="status">
                    <span>A saved draft of a {entityName} exists from a previous session.</span>
                    <button type="button" className="admin-ghost" onClick={restoreDraft}>Restore draft</button>
                    <button type="button" className="admin-icon-btn" onClick={dismissDraft} aria-label="Discard draft"><X /></button>
                </div>
            )}

            {editing && (
                <section className="admin-editor-panel">
                    <div className="admin-editor-head">
                        <h2>{editing.id ? `Edit ${entityName}` : `New ${entityName}`}</h2>
                        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                            {previewUrlOf && previewUrlOf(editing.draft) && (
                                <a className="admin-icon-btn" href={previewUrlOf(editing.draft) as string} target="_blank" rel="noopener noreferrer" title="Open the live page preview in a new tab">
                                    <Eye /> Preview
                                </a>
                            )}
                            <button type="button" className="admin-icon-btn" onClick={tryCloseEditor} aria-label="Cancel">
                                <X />
                            </button>
                        </div>
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
                            <button type="button" className="admin-ghost" onClick={tryCloseEditor}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {bulkPublish && selected.size > 0 && (
                <div className="admin-bulk" role="region" aria-label="Bulk actions">
                    <ListChecks aria-hidden="true" />
                    <span>{selected.size} selected</span>
                    <button type="button" className="admin-ghost" disabled={busy} onClick={() => void bulkSetPublished(true)}>
                        Publish
                    </button>
                    <button type="button" className="admin-ghost" disabled={busy} onClick={() => void bulkSetPublished(false)}>
                        Unpublish
                    </button>
                    <button type="button" className="admin-icon-btn" onClick={() => setSelected(new Set())} aria-label="Clear selection">
                        <X />
                    </button>
                </div>
            )}

            {data && (
                <div className="admin-toolbar">
                    <div className="admin-search">
                        <Search aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Filter ${entityName.toLowerCase()}s…`}
                            aria-label={`Filter ${entityName.toLowerCase()}s`}
                        />
                    </div>
                </div>
            )}

            <div className="admin-table">
                <div className="admin-tr admin-th admin-tr-crud">
                    {bulkPublish && <span aria-hidden="true" className="bulk-col-head" />}
                    {columns.map((c) => (
                        <span key={c}>{c}</span>
                    ))}
                    <span aria-hidden="true" />
                </div>
                {data?.items
                    .filter((item) =>
                        search.trim()
                            ? JSON.stringify(item).toLowerCase().includes(search.trim().toLowerCase())
                            : true,
                    )
                    .map((item) => {
                    const id = idOf(item);
                    return (
                        <div className={`admin-tr admin-tr-static admin-tr-crud ${selected.has(id) ? 'selected' : ''}`} key={id}>
                            {bulkPublish && (
                                <span className="bulk-col">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(id)}
                                        onChange={() => toggleSelect(id)}
                                        aria-label={`Select ${entityName}`}
                                    />
                                </span>
                            )}
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
