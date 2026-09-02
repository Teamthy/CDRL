'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Mail, Save } from 'lucide-react';
import {
    adminFetch,
    UnauthorizedError,
    type Enquiry,
    type EnquiryStatus,
    type ListResponse,
} from '../../../lib/adminClient';

const STATUSES: EnquiryStatus[] = ['new', 'contacted', 'qualified', 'closed'];

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function EnquiriesPage() {
    const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');
    const [data, setData] = useState<ListResponse<Enquiry> | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { status: EnquiryStatus; notes: string }>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setError(null);
        try {
            const suffix = filter === 'all' ? '' : `?status=${filter}`;
            setData(await adminFetch<ListResponse<Enquiry>>(`/admin/enquiries${suffix}`));
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, [filter]);

    useEffect(() => {
        void reload();
    }, [reload]);

    const items = useMemo(() => data?.items ?? [], [data]);

    function openRow(e: Enquiry) {
        setOpenId((cur) => (cur === e.id ? null : e.id));
        setDrafts((d) => ({ ...d, [e.id]: { status: e.status, notes: e.notes ?? '' } }));
    }

    async function save(e: Enquiry) {
        const draft = drafts[e.id];
        if (!draft) return;
        setSavingId(e.id);
        setNotice(null);
        try {
            await adminFetch(`/admin/enquiries/${e.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: draft.status, notes: draft.notes || null }),
            });
            setNotice(`Saved: ${e.name} → ${draft.status}`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setSavingId(null);
        }
    }

    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <span className="kicker">CRM</span>
                <h1>Enquiries</h1>
                <p className="admin-sub">
                    {data ? `${data.total} total` : '…'} — every contact-form submission lands here and reaches
                    yinklad2k@gmail.com by email.
                </p>
            </header>

            <div className="admin-filters" role="tablist" aria-label="Filter by status">
                {(['all', ...STATUSES] as const).map((s) => (
                    <button
                        key={s}
                        role="tab"
                        aria-selected={filter === s}
                        className={filter === s ? 'on' : ''}
                        onClick={() => setFilter(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {notice && <p className="admin-notice" role="status">{notice}</p>}

            <div className="admin-table">
                <div className="admin-tr admin-th">
                    <span>Received</span>
                    <span>Name / Organization</span>
                    <span>Interest</span>
                    <span>Status</span>
                    <span aria-hidden="true" />
                </div>
                {items.map((e) => {
                    const draft = drafts[e.id];
                    const open = openId === e.id;
                    return (
                        <div key={e.id} className={`admin-row ${open ? 'open' : ''}`}>
                            <button type="button" className="admin-tr" onClick={() => openRow(e)} aria-expanded={open}>
                                <span>{formatDate(e.createdAt)}</span>
                                <span>
                                    <strong>{e.name}</strong>
                                    {e.organization && <em>{e.organization}</em>}
                                </span>
                                <span>{e.interest}</span>
                                <span>
                                    <span className={`status-pill s-${e.status}`}>{e.status}</span>
                                </span>
                                <ChevronDown className="row-caret" />
                            </button>
                            {open && draft && (
                                <div className="admin-detail">
                                    <p className="admin-msg">{e.message}</p>
                                    {e.email && (
                                        <a className="admin-mailto" href={`mailto:${e.email}`}>
                                            <Mail /> Reply to {e.email}
                                        </a>
                                    )}
                                    <div className="admin-edit">
                                        <label>
                                            Status
                                            <select
                                                value={draft.status}
                                                onChange={(ev) =>
                                                    setDrafts((d) => ({
                                                        ...d,
                                                        [e.id]: { ...draft, status: ev.target.value as EnquiryStatus },
                                                    }))
                                                }
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="admin-notes">
                                            Notes (internal)
                                            <textarea
                                                rows={3}
                                                placeholder="Follow-up details, promises made, next steps…"
                                                value={draft.notes}
                                                onChange={(ev) =>
                                                    setDrafts((d) => ({
                                                        ...d,
                                                        [e.id]: { ...draft, notes: ev.target.value },
                                                    }))
                                                }
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="admin-save"
                                            disabled={savingId === e.id}
                                            onClick={() => void save(e)}
                                        >
                                            <Save />
                                            {savingId === e.id ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {data && items.length === 0 && <p className="admin-empty">No enquiries in this view yet.</p>}
            </div>
        </div>
    );
}
