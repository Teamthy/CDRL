'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { UserPlus, Link2, Layers } from 'lucide-react';
import { adminFetch, UnauthorizedError, type ListResponse } from '../../../lib/adminClient';
import { Checkbox, Field, TextArea, TextInput } from '../../../components/admin/fields';

type RoleFilter = 'student' | 'tutor';

interface LmsUser {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
}

interface EnrollmentRow {
    id: string;
    status: string;
    progress: number;
    student: { name: string; email: string };
    tutor: { name: string; email: string } | null;
    course: { title: string; slug: string };
}

interface ModuleRow {
    id: string;
    title: string;
    order: number;
    course: { slug: string; title: string };
}

const tabs = ['People', 'Enrollments', 'Modules', 'Recordings'] as const;
type Tab = (typeof tabs)[number];

export default function LmsAdminPage() {
    const [tab, setTab] = useState<Tab>('People');
    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <span className="kicker">LEARNING PLATFORM</span>
                <h1>LMS</h1>
                <p className="admin-sub">
                    Students, tutors, enrollments and course content outlines. The learner-facing portal is the next
                    phase — everything you create here is stored and ready for it.
                </p>
            </header>
            <div className="admin-filters admin-tabs" role="tablist" aria-label="LMS sections">
                {tabs.map((t) => (
                    <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                        {t}
                    </button>
                ))}
            </div>
            {tab === 'People' && <PeopleSection />}
            {tab === 'Enrollments' && <EnrollmentsSection />}
            {tab === 'Modules' && <ModulesSection />}
            {tab === 'Recordings' && <RecordingsSection />}
        </div>
    );
}

/* ── People (students & tutors) ──────────────────────────────────────────── */

function PeopleSection() {
    const [role, setRole] = useState<RoleFilter>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [users, setUsers] = useState<LmsUser[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const res = await adminFetch<ListResponse<LmsUser>>('/admin/lms/users');
            setUsers(res.items);
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    async function create(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            await adminFetch('/admin/lms/users', {
                method: 'POST',
                body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
            });
            setNotice(`${role === 'tutor' ? 'Tutor' : 'Student'} "${name.trim()}" saved.`);
            setName('');
            setEmail('');
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    async function toggleStatus(u: LmsUser) {
        const next = u.status === 'active' ? 'suspended' : 'active';
        try {
            await adminFetch(`/admin/lms/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    return (
        <section className="admin-editor-panel">
            <h2 className="admin-lms-h">Add a person</h2>
            <form className="admin-form" onSubmit={create}>
                <TextInput label="Full name" value={name} onChange={setName} required />
                <TextInput label="Email" type="text" value={email} onChange={setEmail} required />
                <Field label="Role">
                    <select value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                    </select>
                </Field>
                <div className="admin-form-actions">
                    <button type="submit" className="admin-save" disabled={busy}>
                        <UserPlus /> {busy ? 'Saving…' : 'Save person'}
                    </button>
                </div>
            </form>
            {error && <p className="admin-error">{error}</p>}
            {notice && <p className="admin-notice">{notice}</p>}
            <div className="admin-table admin-table-plain">
                <div className="admin-tr admin-th admin-tr-lms">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span aria-hidden="true" />
                </div>
                {users.map((u) => (
                    <div key={u.id} className="admin-tr admin-tr-static admin-tr-lms">
                        <span><strong>{u.name}</strong></span>
                        <span>{u.email}</span>
                        <span>{u.role}</span>
                        <span>
                            <span className={`status-pill ${u.status === 'active' ? 's-qualified' : 's-closed'}`}>{u.status}</span>
                        </span>
                        <span>
                            <button type="button" className="admin-ghost" onClick={() => void toggleStatus(u)}>
                                {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                        </span>
                    </div>
                ))}
                {users.length === 0 && <p className="admin-empty">No people yet.</p>}
            </div>
        </section>
    );
}

/* ── Enrollments ─────────────────────────────────────────────────────────── */

function EnrollmentsSection() {
    const [studentEmail, setStudentEmail] = useState('');
    const [courseSlug, setCourseSlug] = useState('');
    const [tutorEmail, setTutorEmail] = useState('');
    const [rows, setRows] = useState<EnrollmentRow[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const res = await adminFetch<ListResponse<EnrollmentRow>>('/admin/lms/enrollments');
            setRows(res.items);
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    async function enroll(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            await adminFetch('/admin/lms/enrollments', {
                method: 'POST',
                body: JSON.stringify({
                    studentEmail: studentEmail.trim(),
                    courseSlug: courseSlug.trim(),
                    tutorEmail: tutorEmail.trim() || null,
                }),
            });
            setNotice(`Enrolled ${studentEmail.trim()} in ${courseSlug.trim()}.`);
            setStudentEmail('');
            setCourseSlug('');
            setTutorEmail('');
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    async function patchRow(row: EnrollmentRow, patch: Record<string, unknown>) {
        try {
            await adminFetch(`/admin/lms/enrollments/${row.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    return (
        <section className="admin-editor-panel">
            <h2 className="admin-lms-h">Enroll a student</h2>
            <form className="admin-form" onSubmit={enroll}>
                <TextInput label="Student email" value={studentEmail} onChange={setStudentEmail} required />
                <TextInput label="Course slug" value={courseSlug} onChange={setCourseSlug} required placeholder="iso-iec-27001-foundation" />
                <TextInput label="Tutor email (optional)" value={tutorEmail} onChange={setTutorEmail} />
                <div className="admin-form-actions">
                    <button type="submit" className="admin-save" disabled={busy}>
                        <Link2 /> {busy ? 'Enrolling…' : 'Enroll'}
                    </button>
                </div>
            </form>
            <p className="admin-hint">If the student email is new, an account is created automatically. Duplicates are blocked (409).</p>
            {error && <p className="admin-error">{error}</p>}
            {notice && <p className="admin-notice">{notice}</p>}
            <div className="admin-table admin-table-plain">
                <div className="admin-tr admin-th admin-tr-enroll">
                    <span>Student</span>
                    <span>Course</span>
                    <span>Tutor</span>
                    <span>Progress</span>
                    <span>Status</span>
                </div>
                {rows.map((r) => (
                    <div key={r.id} className="admin-tr admin-tr-static admin-tr-enroll">
                        <span>
                            <strong>{r.student.name}</strong>
                            <em>{r.student.email}</em>
                        </span>
                        <span>{r.course.title}</span>
                        <span>{r.tutor?.name ?? '—'}</span>
                        <span>
                            <input
                                className="admin-progress"
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={r.progress}
                                aria-label="Progress percent"
                                onBlur={(e) => {
                                    const v = Number.parseInt(e.target.value, 10);
                                    if (!Number.isNaN(v) && v !== r.progress) void patchRow(r, { progress: v });
                                }}
                            />
                            %
                        </span>
                        <span>
                            <select
                                value={r.status}
                                onChange={(e) => void patchRow(r, { status: e.target.value })}
                                className="admin-inline-select"
                                aria-label="Enrollment status"
                            >
                                <option value="active">active</option>
                                <option value="completed">completed</option>
                                <option value="paused">paused</option>
                            </select>
                        </span>
                    </div>
                ))}
                {rows.length === 0 && <p className="admin-empty">No enrollments yet.</p>}
            </div>
        </section>
    );
}

/* ── Modules (course outlines) ───────────────────────────────────────────── */

interface ModuleRowFull extends ModuleRow {
    body: string | null;
    published: boolean;
}

function ModulesSection() {
    const [courseSlug, setCourseSlug] = useState('');
    const [title, setTitle] = useState('');
    const [order, setOrder] = useState('0');
    const [body, setBody] = useState('');
    const [published, setPublished] = useState(true);
    const [rows, setRows] = useState<ModuleRowFull[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { title: string; order: string; body: string; published: boolean }>>({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const res = await adminFetch<ListResponse<ModuleRowFull>>('/admin/lms/modules');
            setRows(res.items);
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    async function create(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            await adminFetch('/admin/lms/modules', {
                method: 'POST',
                body: JSON.stringify({
                    courseSlug: courseSlug.trim(),
                    title: title.trim(),
                    order: Number.parseInt(order, 10) || 0,
                    body: body.trim() || null,
                    published,
                }),
            });
            setNotice(`Module "${title.trim()}" added to ${courseSlug.trim()}.`);
            setTitle('');
            setBody('');
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    function openRow(m: ModuleRowFull) {
        setOpenId((cur) => (cur === m.id ? null : m.id));
        setDrafts((d) => ({
            ...d,
            [m.id]: { title: m.title, order: String(m.order), body: m.body ?? '', published: m.published },
        }));
    }

    async function save(m: ModuleRowFull) {
        const draft = drafts[m.id];
        if (!draft) return;
        setError(null);
        setNotice(null);
        try {
            await adminFetch(`/admin/lms/modules/${m.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: draft.title.trim(),
                    order: Number.parseInt(draft.order, 10) || 0,
                    body: draft.body.trim() || null,
                    published: draft.published,
                }),
            });
            setNotice(`Module "${draft.title.trim()}" saved.`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    async function remove(m: ModuleRowFull) {
        if (!window.confirm(`Delete module "${m.title}"? This cannot be undone.`)) return;
        setError(null);
        try {
            await adminFetch(`/admin/lms/modules/${m.id}`, { method: 'DELETE' });
            setNotice(`Module "${m.title}" deleted.`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    return (
        <section className="admin-editor-panel">
            <h2 className="admin-lms-h">Add a course module</h2>
            <form className="admin-form" onSubmit={create}>
                <TextInput label="Course slug" value={courseSlug} onChange={setCourseSlug} required placeholder="iso-iec-27001-foundation" />
                <TextInput label="Module title" value={title} onChange={setTitle} required placeholder="Module 1 — Introduction" />
                <TextInput label="Order" type="number" value={order} onChange={setOrder} />
                <Checkbox label="Published" checked={published} onChange={setPublished} hint="Visible to enrolled learners immediately" />
                <TextArea label="Module content / notes (optional)" value={body} onChange={setBody} rows={4} />
                <div className="admin-form-actions">
                    <button type="submit" className="admin-save" disabled={busy}>
                        <Layers /> {busy ? 'Saving…' : 'Add module'}
                    </button>
                </div>
            </form>
            <p className="admin-hint">Ordered outlines per course. Unpublished modules stay hidden from learners until you publish them.</p>
            {error && <p className="admin-error">{error}</p>}
            {notice && <p className="admin-notice">{notice}</p>}
            <div className="admin-table admin-table-plain">
                <div className="admin-tr admin-th admin-tr-lms">
                    <span>Course</span>
                    <span>Module</span>
                    <span>Order</span>
                    <span>Visibility</span>
                    <span aria-hidden="true" />
                </div>
                {rows.map((m) => {
                    const draft = drafts[m.id];
                    const open = openId === m.id;
                    return (
                        <div key={m.id} className={`admin-row ${open ? 'open' : ''}`}>
                            <button type="button" className="admin-tr admin-tr-lms" onClick={() => openRow(m)} aria-expanded={open}>
                                <span>{m.course.slug}</span>
                                <span><strong>{m.title}</strong></span>
                                <span>{m.order}</span>
                                <span>
                                    <span className={`status-pill ${m.published ? 's-qualified' : 's-closed'}`}>
                                        {m.published ? 'published' : 'draft'}
                                    </span>
                                </span>
                                <span className="admin-ghost">Edit</span>
                            </button>
                            {open && draft && (
                                <div className="admin-detail">
                                    <div className="admin-form">
                                        <TextInput label="Title" value={draft.title} onChange={(v) => setDrafts((d) => ({ ...d, [m.id]: { ...draft, title: v } }))} />
                                        <TextInput label="Order" type="number" value={draft.order} onChange={(v) => setDrafts((d) => ({ ...d, [m.id]: { ...draft, order: v } }))} />
                                        <Checkbox label="Published" checked={draft.published} onChange={(v) => setDrafts((d) => ({ ...d, [m.id]: { ...draft, published: v } }))} />
                                        <TextArea label="Content / notes (blank-line = new paragraph)" value={draft.body} onChange={(v) => setDrafts((d) => ({ ...d, [m.id]: { ...draft, body: v } }))} rows={8} />
                                    </div>
                                    <div className="admin-form-actions">
                                        <button type="button" className="admin-save" onClick={() => void save(m)}>Save module</button>
                                        <button type="button" className="admin-ghost admin-danger" onClick={() => void remove(m)}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {rows.length === 0 && <p className="admin-empty">No modules yet.</p>}
            </div>
        </section>
    );
}

/* ── Recordings (session recording links) ────────────────────────────────── */

interface RecordingRow {
    id: string;
    title: string;
    url: string;
    description: string | null;
    order: number;
    published: boolean;
    course: { slug: string; title: string };
}

function RecordingsSection() {
    const [courseSlug, setCourseSlug] = useState('');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [order, setOrder] = useState('0');
    const [description, setDescription] = useState('');
    const [published, setPublished] = useState(true);
    const [rows, setRows] = useState<RecordingRow[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { title: string; url: string; order: string; description: string; published: boolean }>>({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const res = await adminFetch<ListResponse<RecordingRow>>('/admin/lms/recordings');
            setRows(res.items);
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    async function create(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            await adminFetch('/admin/lms/recordings', {
                method: 'POST',
                body: JSON.stringify({
                    courseSlug: courseSlug.trim(),
                    title: title.trim(),
                    url: url.trim(),
                    order: Number.parseInt(order, 10) || 0,
                    description: description.trim() || null,
                    published,
                }),
            });
            setNotice(`Recording "${title.trim()}" added to ${courseSlug.trim()}.`);
            setTitle('');
            setUrl('');
            setDescription('');
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    function openRow(r: RecordingRow) {
        setOpenId((cur) => (cur === r.id ? null : r.id));
        setDrafts((d) => ({
            ...d,
            [r.id]: { title: r.title, url: r.url, order: String(r.order), description: r.description ?? '', published: r.published },
        }));
    }

    async function save(r: RecordingRow) {
        const draft = drafts[r.id];
        if (!draft) return;
        setError(null);
        setNotice(null);
        try {
            await adminFetch(`/admin/lms/recordings/${r.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: draft.title.trim(),
                    url: draft.url.trim(),
                    order: Number.parseInt(draft.order, 10) || 0,
                    description: draft.description.trim() || null,
                    published: draft.published,
                }),
            });
            setNotice(`Recording "${draft.title.trim()}" saved.`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    async function remove(r: RecordingRow) {
        if (!window.confirm(`Delete recording "${r.title}"?`)) return;
        setError(null);
        try {
            await adminFetch(`/admin/lms/recordings/${r.id}`, { method: 'DELETE' });
            setNotice(`Recording "${r.title}" deleted.`);
            await reload();
        } catch (err) {
            if (!(err instanceof UnauthorizedError)) setError((err as Error).message);
        }
    }

    const hostOf = (u: string) => {
        try {
            return new URL(u).host;
        } catch {
            return u;
        }
    };

    return (
        <section className="admin-editor-panel">
            <h2 className="admin-lms-h">Add a session recording</h2>
            <form className="admin-form" onSubmit={create}>
                <TextInput label="Course slug" value={courseSlug} onChange={setCourseSlug} required placeholder="iso-iec-27001-foundation" />
                <TextInput label="Recording title" value={title} onChange={setTitle} required placeholder="Week 1 live session" />
                <TextInput label="URL (YouTube, Drive, Vimeo…)" value={url} onChange={setUrl} required placeholder="https://youtu.be/…" />
                <TextInput label="Order" type="number" value={order} onChange={setOrder} />
                <Checkbox label="Published" checked={published} onChange={setPublished} hint="Visible to enrolled learners immediately" />
                <TextArea label="Description (optional)" value={description} onChange={setDescription} rows={3} />
                <div className="admin-form-actions">
                    <button type="submit" className="admin-save" disabled={busy}>
                        {busy ? 'Saving…' : 'Add recording'}
                    </button>
                </div>
            </form>
            <p className="admin-hint">YouTube links embed in the learner portal; anything else becomes a tidy link card.</p>
            {error && <p className="admin-error">{error}</p>}
            {notice && <p className="admin-notice">{notice}</p>}
            <div className="admin-table admin-table-plain">
                <div className="admin-tr admin-th admin-tr-lms">
                    <span>Course</span>
                    <span>Recording</span>
                    <span>Host</span>
                    <span>Visibility</span>
                    <span aria-hidden="true" />
                </div>
                {rows.map((r) => {
                    const draft = drafts[r.id];
                    const open = openId === r.id;
                    return (
                        <div key={r.id} className={`admin-row ${open ? 'open' : ''}`}>
                            <button type="button" className="admin-tr admin-tr-lms" onClick={() => openRow(r)} aria-expanded={open}>
                                <span>{r.course.slug}</span>
                                <span><strong>{r.title}</strong></span>
                                <span>{hostOf(r.url)}</span>
                                <span>
                                    <span className={`status-pill ${r.published ? 's-qualified' : 's-closed'}`}>
                                        {r.published ? 'published' : 'draft'}
                                    </span>
                                </span>
                                <span className="admin-ghost">Edit</span>
                            </button>
                            {open && draft && (
                                <div className="admin-detail">
                                    <div className="admin-form">
                                        <TextInput label="Title" value={draft.title} onChange={(v) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, title: v } }))} />
                                        <TextInput label="URL" value={draft.url} onChange={(v) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, url: v } }))} />
                                        <TextInput label="Order" type="number" value={draft.order} onChange={(v) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, order: v } }))} />
                                        <Checkbox label="Published" checked={draft.published} onChange={(v) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, published: v } }))} />
                                        <TextArea label="Description" value={draft.description} onChange={(v) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, description: v } }))} rows={3} />
                                    </div>
                                    <div className="admin-form-actions">
                                        <button type="button" className="admin-save" onClick={() => void save(r)}>Save recording</button>
                                        <button type="button" className="admin-ghost admin-danger" onClick={() => void remove(r)}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {rows.length === 0 && <p className="admin-empty">No recordings yet.</p>}
            </div>
        </section>
    );
}
