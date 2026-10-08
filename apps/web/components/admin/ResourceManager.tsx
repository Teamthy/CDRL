'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ListChecks, Pencil, Plus, Search, Trash2, X, Eye } from 'lucide-react';
import { adminFetch, UnauthorizedError, type ListResponse } from '../../lib/adminClient';

/** Rows per page. The API clamps at LIST_LIMIT_MAX (200); this stays scannable. */
const PAGE_SIZE = 50;

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
    const [page, setPage] = useState(0);
    // Set after a soft delete so the admin can still escalate to a real one.
    const [pendingHardDelete, setPendingHardDelete] = useState<string | null>(null);

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
            // Ask for one page and tell the server where it starts. The old
            // `?limit=200` exceeded the API's cap, so the query failed validation
            // and every list silently served 50 rows with no way to see the rest.
            setData(
                await adminFetch<ListResponse<T>>(
                    `${endpoint}?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
                ),
            );
            setSelected(new Set());
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, [endpoint, page]);

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

    // A different collection starts at its own first page.
    useEffect(() => {
        setPage(0);
    }, [endpoint]);

    // Deleting the last row of the last page must not strand the user on an
    // empty page with no way back.
    useEffect(() => {
        if (data && data.items.length === 0 && data.total > 0 && page > 0) {
            setPage((p) => Math.max(0, Math.min(p - 1, Math.ceil(data.total / PAGE_SIZE) - 1)));
        }
    }, [data, page]);

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

    /**
     * Delete, or — where the API protects dependent data — retire.
     *
     * /admin/courses answers a plain DELETE with `{ archived: true }`: the row is
     * unpublished, not destroyed, because enrolments, modules, recordings and
     * progress all cascade from Course. The permanent variant is opt-in and the
     * API refuses it (409) while learners or purchases reference the course.
     */
    async function remove(id: string, hard = false) {
        setError(null);
        try {
            const result = await adminFetch<{ archived?: boolean; message?: string } | undefined>(
                `${endpoint}/${id}${hard ? '?hard=true' : ''}`,
                { method: 'DELETE' },
            );
            if (result?.archived) {
                setNotice(result.message ?? `${entityName} unpublished.`);
                setPendingHardDelete(id);
            } else {
                setNotice(`${entityName} deleted.`);
                setPendingHardDelete(null);
            }
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    const total = data?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const pageRows = data?.items.length ?? 0;
    const rangeStart = pageRows === 0 ? 0 : page * PAGE_SIZE + 1;
    const rangeEnd = page * PAGE_SIZE + pageRows;
    const paginated = total > PAGE_SIZE;

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
            {notice && (
                <div className="admin-notice" role="status">
                    <span>{notice}</span>
                    {pendingHardDelete && (
                        <button
                            type="button"
                            className="admin-ghost danger"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        `Permanently delete this ${entityName.toLowerCase()}? This cannot be undone. It will be refused if any learner data still references it.`,
                                    )
                                ) {
                                    const id = pendingHardDelete;
                                    setPendingHardDelete(null);
                                    void remove(id, true);
                                }
                            }}
                        >
                            Delete permanently
                        </button>
                    )}
                </div>
            )}
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
                            placeholder={paginated ? `Filter this page…` : `Filter ${entityName.toLowerCase()}s…`}
                            aria-label={`Filter ${entityName.toLowerCase()}s`}
                        />
                    </div>
                    <p className="admin-count" role="status">
                        {total === 0
                            ? `No ${entityName.toLowerCase()}s yet`
                            : `Showing ${rangeStart}–${rangeEnd} of ${total} ${entityName.toLowerCase()}${total === 1 ? '' : 's'}`}
                    </p>
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

            {paginated && (
                <nav className="admin-pager" aria-label={`${entityName} pagination`}>
                    <button
                        type="button"
                        className="admin-ghost"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft aria-hidden="true" /> Previous
                    </button>
                    <span aria-live="polite">
                        Page {page + 1} of {pageCount}
                    </span>
                    <button
                        type="button"
                        className="admin-ghost"
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                        disabled={page >= pageCount - 1}
                    >
                        Next <ChevronRight aria-hidden="true" />
                    </button>
                </nav>
            )}
        </div>
    );
}
