'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
    LearnerUnauthorizedError,
    clearLearnerToken,
    learnerMe,
    type LearnerMe,
} from '../../lib/learnerClient';

/**
 * Learner dashboard (Phase 2 scaffold): identity + enrollment list.
 * Module delivery arrives in Phase 3/4 — this proves the auth loop end-to-end.
 */
export default function LearnerDashboard() {
    const router = useRouter();
    const [data, setData] = useState<LearnerMe | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        learnerMe()
            .then(setData)
            .catch((err) => {
                if (err instanceof LearnerUnauthorizedError) {
                    router.replace('/sign-in');
                } else {
                    setError((err as Error).message);
                }
            });
    }, [router]);

    function signOut() {
        clearLearnerToken();
        router.replace('/sign-in');
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
                                        <Link href={`/training/${e.course.slug}` as Route}>{e.course.title}</Link>
                                    </strong>
                                    <span className="learn-track">{e.course.track}</span>
                                </div>
                                <span className={`status-pill s-${e.status}`}>{e.status}</span>
                            </div>
                            <div className="learn-progress" role="progressbar" aria-valuenow={e.progress} aria-valuemin={0} aria-valuemax={100}>
                                <span style={{ width: `${e.progress}%` }} />
                            </div>
                            <p className="learn-meta">
                                {e.progress}% complete{e.tutor ? ` · Tutor: ${e.tutor}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            <p className="learner-note">
                Course modules and live sessions arrive with the next phase of the portal — your enrolment and
                progress above already update in real time.
            </p>
        </div>
    );
}
