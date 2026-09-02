'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
    LearnerUnauthorizedError,
    NotEnrolledError,
    learnerCourseModules,
    type LearnerCourseView,
} from '../../../lib/learnerClient';

/** Module player (Phase 3/4): ordered published modules; click a row to read the module notes. */
export default function CoursePlayer({ slug }: { slug: string }) {
    const router = useRouter();
    const [data, setData] = useState<LearnerCourseView | null>(null);
    const [problem, setProblem] = useState<'none' | 'not-enrolled' | 'error'>('none');
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        learnerCourseModules(slug)
            .then((d) => {
                setData(d);
                setOpenId(d.modules[0]?.id ?? null);
            })
            .catch((err) => {
                if (err instanceof LearnerUnauthorizedError) router.replace('/sign-in');
                else if (err instanceof NotEnrolledError) setProblem('not-enrolled');
                else setProblem('error');
            });
    }, [slug, router]);

    if (problem === 'not-enrolled') {
        return (
            <div className="auth-card">
                <h1>Not enrolled yet</h1>
                <p className="auth-sub">
                    Modules unlock once your enrolment is confirmed. You can apply from the course page.
                </p>
                <Link href="/learner" className="text-link"><span>← My learning</span></Link>
            </div>
        );
    }
    if (problem === 'error') return <p className="auth-error" role="alert">Could not load this course. Try again shortly.</p>;
    if (!data) return <p className="auth-sub">Loading modules…</p>;

    return (
        <div className="learner-dash">
            <header className="learner-head">
                <div>
                    <span className="kicker">{data.course.track.toUpperCase()}</span>
                    <h1>{data.course.title}</h1>
                    <p className="auth-sub">
                        {data.enrollment.progress}% complete · status: {data.enrollment.status}
                    </p>
                </div>
                <Link href="/learner" className="auth-ghost">← My learning</Link>
            </header>

            <div className="learn-progress" role="progressbar" aria-valuenow={data.enrollment.progress} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${data.enrollment.progress}%` }} />
            </div>

            {data.modules.length === 0 ? (
                <div className="learn-card learn-empty">
                    <p>The outline for this course is being prepared — check back soon.</p>
                </div>
            ) : (
                <ol className="module-list">
                    {data.modules.map((m, i) => {
                        const open = openId === m.id;
                        const paragraphs = (m.body ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
                        return (
                            <li key={m.id} className={`learn-card module-item ${open ? 'open' : ''}`}>
                                <button type="button" className="module-head" onClick={() => setOpenId(open ? null : m.id)} aria-expanded={open}>
                                    <span className="module-num">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="module-title">{m.title}</span>
                                    <ChevronDown aria-hidden="true" />
                                </button>
                                {open && (
                                    <div className="module-body">
                                        {paragraphs.length === 0 ? (
                                            <p className="auth-sub">Module notes are being prepared.</p>
                                        ) : (
                                            paragraphs.map((p, j) => <p key={j}>{p}</p>)
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}
