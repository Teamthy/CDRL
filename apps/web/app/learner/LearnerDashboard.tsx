'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, UserPen } from 'lucide-react';
import {
    LearnerUnauthorizedError,
    learnerChangePassword,
    learnerMe,
    learnerSignOut,
    learnerUpdateName,
    tutorEnrollments,
    tutorGrade,
    type LearnerMe,
    type TutorEnrollment,
} from '../../lib/learnerClient';

/**
 * Learner dashboard (Phase 2 scaffold): identity + enrollment list.
 * Module delivery arrives in Phase 3/4 — this proves the auth loop end-to-end.
 */
export default function LearnerDashboard() {
    const router = useRouter();
    const [data, setData] = useState<LearnerMe | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tutorRows, setTutorRows] = useState<TutorEnrollment[] | null>(null);

    useEffect(() => {
        learnerMe()
            .then((me) => {
                setData(me);
                if (me.user.role === 'tutor') {
                    tutorEnrollments().then(setTutorRows).catch(() => undefined);
                }
            })
            .catch((err) => {
                if (err instanceof LearnerUnauthorizedError) {
                    router.replace('/sign-in');
                } else {
                    setError((err as Error).message);
                }
            });
    }, [router]);

    async function grade(id: string, patch: { progress?: number; status?: string }) {
        try {
            await tutorGrade(id, patch);
            setTutorRows(await tutorEnrollments());
        } catch (err) {
            if (!(err instanceof LearnerUnauthorizedError)) setError((err as Error).message);
            else router.replace('/sign-in');
        }
    }

    function signOut() {
        void learnerSignOut().finally(() => router.replace('/sign-in'));
    }

    if (error) return <p className="auth-error" role="alert">{error}</p>;
    if (!data) return <p className="auth-sub">Loading your learning…</p>;

    return (
        <div className="learner-dash">
            <header className="learner-head">
                <div>
                    <span className="kicker">MY LEARNING</span>
                    <h1>Hello, {data.user.name.split(' ')[0]}.</h1>
                    <p className="auth-sub">{data.user.email}</p>
                </div>
                <button type="button" className="auth-ghost" onClick={signOut}>
                    <LogOut aria-hidden="true" /> Sign out
                </button>
            </header>

            {/* patch-44: profile card — rename + change password inline */}
            <section className="profile-card" aria-label="Profile and security">
                <div className="profile-row">
                    <UserPen aria-hidden="true" />
                    <strong>Profile</strong>
                    <span className="learn-track">{data.user.name} · student</span>
                </div>
                <form
                    className="profile-form"
                    onSubmit={async (ev) => {
                        ev.preventDefault();
                        const fd = new FormData(ev.currentTarget);
                        const name = String(fd.get('name') ?? '').trim();
                        if (name && name !== data.user.name) {
                            const updated = await learnerUpdateName(name);
                            if (updated) setData({ ...data, user: updated });
                        }
                    }}
                >
                    <input name="name" defaultValue={data.user.name} aria-label="Display name" minLength={2} maxLength={80} />
                    <button type="submit" className="auth-ghost small">Save name</button>
                </form>
                <details className="pwchange">
                    <summary><KeyRound aria-hidden="true" /> Change password</summary>
                    <form
                        onSubmit={async (ev) => {
                            ev.preventDefault();
                            const fd = new FormData(ev.currentTarget);
                            const cur = String(fd.get('current') ?? '');
                            const next = String(fd.get('next') ?? '');
                            const r = await learnerChangePassword(cur, next);
                            setError(r.ok ? null : (r.message ?? 'Change failed'));
                            if (r.ok) ev.currentTarget.reset();
                        }}
                    >
                        <input type="password" name="current" placeholder="Current password" required autoComplete="current-password" />
                        <input type="password" name="next" placeholder="New password (8+ characters)" required minLength={8} autoComplete="new-password" />
                        <button type="submit">Update password</button>
                    </form>
                </details>
            </section>

            <h2 className="learner-h">Your enrolments</h2>
            {data.enrollments.length === 0 ? (
                <div className="learn-card learn-empty">
                    <p>You are not enrolled in a course yet.</p>
                    <Link href={'/training' as Route} className="text-link">
                        <span>Browse the catalogue</span>
                    </Link>
                </div>
            ) : (
                <ul className="learn-list">
                    {data.enrollments.map((e) => (
                        <li key={e.id} className="learn-card">
                            <div className="learn-row">
                                <div>
                                    <strong>
                                        <Link href={`/learner/${e.course.slug}` as Route}>{e.course.title}</Link>
                                    </strong>
                                    <span className="learn-track">{e.course.track}</span>
                                </div>
                                <span className={`status-pill s-${e.status}`}>{e.status}</span>
                            </div>
                            <div className="learn-progress" role="progressbar" aria-valuenow={e.progress} aria-valuemin={0} aria-valuemax={100}>
                                <span style={{ width: `${e.progress}%` }} />
                            </div>
                            <p className="learn-meta">
                                {e.progress}% complete{e.tutor ? ` · Tutor: ${e.tutor}` : ''} ·{' '}
                                <Link href={`/learner/${e.course.slug}` as Route}>Open modules →</Link>
                                {e.status === 'completed' && (
                                    <>
                                        {' '}·{' '}
                                        <Link href={`/learner/${e.course.slug}/certificate` as Route}>Certificate 🎓</Link>
                                    </>
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            {data.user.role === 'tutor' && tutorRows && (
                <section className="tutor-zone">
                    <h2 className="learner-h">Students you grade</h2>
                    {tutorRows.length === 0 ? (
                        <div className="learn-card learn-empty"><p>No assigned enrollments yet.</p></div>
                    ) : (
                        <ul className="learn-list">
                            {tutorRows.map((e) => (
                                <li key={e.id} className="learn-card">
                                    <div className="learn-row">
                                        <div>
                                            <strong>{e.student.name}</strong>
                                            <span className="learn-track">
                                                {e.course.title} · {e.student.email}
                                            </span>
                                        </div>
                                        <span className={`status-pill s-${e.status}`}>{e.status}</span>
                                    </div>
                                    <div className="learn-progress" role="progressbar" aria-valuenow={e.progress} aria-valuemin={0} aria-valuemax={100}>
                                        <span style={{ width: `${e.progress}%` }} />
                                    </div>
                                    <div className="tutor-controls">
                                        <label>
                                            Progress %
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                defaultValue={e.progress}
                                                className="admin-progress"
                                                onBlur={(ev) => {
                                                    const v = Number.parseInt(ev.target.value, 10);
                                                    if (!Number.isNaN(v) && v !== e.progress) void grade(e.id, { progress: v });
                                                }}
                                            />
                                        </label>
                                        <button type="button" className="auth-ghost" onClick={() => void grade(e.id, { progress: 100, status: 'completed' })}>
                                            Mark completed
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
            <p className="learner-note">
                Course modules and live sessions arrive with the next phase of the portal — your enrolment and
                progress above already update in real time.
            </p>
        </div>
    );
}
