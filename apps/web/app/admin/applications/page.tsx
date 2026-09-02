'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, GraduationCap, Inbox, Mail, Save } from 'lucide-react';
import EmptyArt from '../../../components/admin/EmptyArt';
import StatusBadge from '../../../components/admin/StatusBadge';
import { adminFetch, UnauthorizedError, type ListResponse } from '../../../lib/adminClient';

const STATUSES = ['new', 'contacted', 'admitted', 'enrolled', 'closed'] as const;
type AppStatus = (typeof STATUSES)[number];

export interface Application {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    courseSlug: string | null;
    courseTitle: string | null;
    track: string | null;
    background: string | null;
    message: string | null;
    status: AppStatus;
    notes: string | null;
    createdAt: string;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Training applications inbox — the intake side of the LMS pipeline. */
export default function ApplicationsPage() {
    const [filter, setFilter] = useState<'all' | AppStatus>('all');
    const [data, setData] = useState<ListResponse<Application> | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { status: AppStatus; notes: string }>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setError(null);
        try {
            const suffix = filter === 'all' ? '' : `?status=${filter}`;
            setData(await adminFetch<ListResponse<Application>>(`/admin/applications${suffix}`));
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, [filter]);

    useEffect(() => {
        void reload();
    }, [reload]);

    function openRow(a: Application) {
        setOpenId((cur) => (cur === a.id ? null : a.id));
        setDrafts((d) => ({ ...d, [a.id]: { status: a.status, notes: a.notes ?? '' } }));
    }

    async function save(a: Application) {
        const draft = drafts[a.id];
        if (!draft) return;
        setSavingId(a.id);
        setNotice(null);
        try {
            await adminFetch(`/admin/applications/${a.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: draft.status, notes: draft.notes || null }),
            });
            setNotice(`Saved: ${a.name} → ${draft.status}`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setSavingId(null);
        }
    }

    const items = data?.items ?? [];

    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <span className="kicker">INTAKE</span>
                <h1>Applications</h1>
                <p className="admin-sub">
                    {data ? `${data.total} total` : '…'} — training applications from course pages. Move applicants
                    through new → contacted → admitted → enrolled.
                </p>
            </header>

            <div className="admin-filters" role="tablist" aria-label="Filter by status">
                {(['all', ...STATUSES] as const).map((s) => (
                    <button key={s} role="tab" aria-selected={filter === s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
                        {s}
                    </button>
                ))}
            </div>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {notice && <p className="admin-notice" role="status">{notice}</p>}

            <div className="admin-table">
                <div className="admin-tr admin-th">
                    <span>Received</span>
                    <span>Applicant / Background</span>
                    <span>Course</span>
                    <span>Status</span>
                    <span aria-hidden="true" />
                </div>
                {items.length === 0 && (
                    <EmptyArt icon={Inbox} title="No applications yet" hint="Applications from course pages and the marketing site funnel here. New ones appear in real-time once published." />
                )}
                {items.map((a) => {
                    const draft = drafts[a.id];
                    const open = openId === a.id;
                    return (
                        <div key={a.id} className={`admin-row ${open ? 'open' : ''}`}>
                            <button type="button" className="admin-tr" onClick={() => openRow(a)} aria-expanded={open}>
                                <span>{formatDate(a.createdAt)}</span>
                                <span>
                                    <strong>{a.name}</strong>
                                    {a.background && <em>{a.background}</em>}
                                </span>
                                <span>{a.courseTitle ?? a.track ?? 'General'}</span>
                                <StatusBadge status={a.status} />
                                <ChevronDown className="row-caret" />
                            </button>
                            {open && draft && (
                                <div className="admin-detail">
                                    {a.message && <p className="admin-msg">{a.message}</p>}
                                    <div className="admin-detail-meta">
                                        {a.phone && <span>📞 {a.phone}</span>}
                                        {a.track && <span><GraduationCap /> Track: {a.track}</span>}
                                    </div>
                                    <a className="admin-mailto" href={`mailto:${a.email}`}>
                                        <Mail /> Reply to {a.email}
                                    </a>
                                    <div className="admin-edit">
                                        <label>
                                            Status
                                            <select
                                                value={draft.status}
                                                onChange={(ev) =>
                                                    setDrafts((d) => ({ ...d, [a.id]: { ...draft, status: ev.target.value as AppStatus } }))
                                                }
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="admin-notes">
                                            Notes (internal)
                                            <textarea
                                                rows={3}
                                                placeholder="Admission decision, payment plan, cohort assignment…"
                                                value={draft.notes}
                                                onChange={(ev) =>
                                                    setDrafts((d) => ({ ...d, [a.id]: { ...draft, notes: ev.target.value } }))
                                                }
                                            />
                                        </label>
                                        <button type="button" className="admin-save" disabled={savingId === a.id} onClick={() => void save(a)}>
                                            <Save />
                                            {savingId === a.id ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                    {(a.status === 'admitted' || a.status === 'enrolled') && (
                                        <p className="admin-hint">
                                            Next step: create the learner under <a href="/admin/lms">LMS → People</a>, then enroll them in{' '}
                                            {a.courseSlug ?? 'their course'} under LMS → Enrollments.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {data && items.length === 0 && <p className="admin-empty">No applications in this view yet.</p>}
            </div>
        </div>
    );
}
