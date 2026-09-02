'use client';

import { useEffect, useState } from 'react';
import { Activity, CircleSlash, RefreshCw } from 'lucide-react';
import EmptyArt from '../../../components/admin/EmptyArt';
import { adminFetch, UnauthorizedError, type ListResponse } from '../../../lib/adminClient';

interface AuditRow {
    id: string;
    actor: string;
    action: 'create' | 'update' | 'delete' | string;
    resource: string;
    targetId: string | null;
    summary: string;
    createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
    create: 'audit-create',
    update: 'audit-update',
    delete: 'audit-delete',
};

export default function ActivityPage() {
    const [rows, setRows] = useState<AuditRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function reload() {
        setError(null);
        try {
            const data = await adminFetch<ListResponse<AuditRow>>('/admin/audit-log?limit=150');
            setRows(data.items);
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
            setRows([]);
        }
    }

    useEffect(() => {
        void reload();
    }, []);
    const [filter, setFilter] = useState('');

    const [actionFilter, setActionFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');

    const shown = rows?.filter(
        (r) =>
            (actionFilter === 'all' || r.action === actionFilter) &&
            (filter.trim()
                ? `${r.summary} ${r.resource} ${r.actor} ${r.action}`.toLowerCase().includes(filter.trim().toLowerCase())
                : true),
    );

    // patch-46: action counts strip
    const counts = { all: rows?.length ?? 0 };
    if (rows) for (const r of rows) counts[r.action as keyof typeof counts] = (counts[r.action as keyof typeof counts] ?? 0) + 1;

    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <span className="kicker">AUDIT</span>
                <h1>Change log</h1>
                <p className="admin-sub">
                    Every console create / update / delete is recorded here — who, what, and when. PECB brand-audit
                    ready.
                </p>
                <div className="admin-toolbar" style={{ marginTop: 14 }}>
                    <div className="admin-search">
                        <input
                            type="search"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filter by summary, resource, actor…"
                            aria-label="Filter activity log"
                        />
                    </div>
                    <button type="button" className="admin-icon-btn" onClick={() => void reload()} title="Refresh">
                        <RefreshCw />
                    </button>
                </div>
                <div className="admin-action-chips" role="tablist" aria-label="Filter by action type">
                    {(['all', 'create', 'update', 'delete'] as const).map((a) => (
                        <button
                            key={a}
                            role="tab"
                            aria-selected={actionFilter === a}
                            className={`admin-chip ${actionFilter === a ? 'on' : ''}`}
                            onClick={() => setActionFilter(a)}
                        >
                            {a}
                            <span className="admin-chip-count">{(counts as Record<string, number>)[a] ?? 0}</span>
                        </button>
                    ))}
                </div>
            </header>

            {error && <p className="admin-error" role="alert">{error}</p>}

            {rows === null ? (
                <p className="admin-sub"><Activity aria-hidden="true" /> Loading activity…</p>
            ) : rows.length === 0 ? (
                <EmptyArt icon={Activity} title="Nothing yet" hint="Console creates, updates, and deletes land here once they happen — by action type, actor, and target." />
            ) : shown && shown.length === 0 ? (
                <p className="admin-sub"><CircleSlash aria-hidden="true" /> No {actionFilter} events match that filter.</p>
            ) : (
                <div className="audit-table">
                    <div className="audit-tr audit-th">
                        <span>When</span>
                        <span>Action</span>
                        <span>Summary</span>
                        <span>Actor</span>
                    </div>
                    {shown?.map((r) => (
                        <div key={r.id} className="audit-tr">
                            <span>{new Date(r.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <span>
                                <em className={`audit-pill ${ACTION_COLORS[r.action] ?? ''}`}>{r.action}</em>
                            </span>
                            <span>
                                {r.summary}
                                {r.targetId && <small className="admin-mono"> · {r.resource}:{r.targetId}</small>}
                            </span>
                            <span>{r.actor}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
