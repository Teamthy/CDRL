'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, Circle, ExternalLink, Loader2 } from 'lucide-react';

import {
    LearnerUnauthorizedError,
    NotEnrolledError,
    learnerCourseModules,
    learnerMarkModuleComplete,
    type LearnerCourseView,
    type LearnerRecording,
} from '../../../lib/learnerClient';
import ModuleText from '../../../components/learn/ModuleText';
import { youtubeId } from '../../../lib/moduleText';

/** Module player (Phase 3/4): ordered published modules; click a row to read the module notes. */
export default function CoursePlayer({ slug }: { slug: string }) {
    const router = useRouter();
    const [data, setData] = useState<LearnerCourseView | null>(null);
    const [problem, setProblem] = useState<'none' | 'not-enrolled' | 'error'>('none');
    const [openId, setOpenId] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [doneIds, setDoneIds] = useState<string[] | null>(null);
    const [marking, setMarking] = useState<string | null>(null);

    async function tick(moduleId: string) {
        if (marking) return;
        setMarking(moduleId);
        try {
            const res = await learnerMarkModuleComplete(slug, moduleId);
            setProgress(res.progress);
            setDoneIds((prev) => [...(prev ?? data?.completedModuleIds ?? []), moduleId]);
        } finally {
            setMarking(null);
        }
    }

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
                        {(progress ?? data.enrollment.progress)}% complete · status: {data.enrollment.status}
                    </p>
                </div>
                <Link href="/learner" className="auth-ghost">← My learning</Link>
            </header>

            <div className="learn-progress" role="progressbar" aria-valuenow={progress ?? data.enrollment.progress} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${progress ?? data.enrollment.progress}%` }} />
            </div>

            {data.modules.length === 0 ? (
                <div className="learn-card learn-empty">
                    <p>The outline for this course is being prepared — check back soon.</p>
                </div>
            ) : (
                <ol className="module-list">
                    {data.modules.map((m, i) => {
                        const open = openId === m.id;
                        return (
                            <li key={m.id} className={`learn-card module-item ${open ? 'open' : ''}`}>
                                <div className="module-head-row">
                                    <button type="button" className="module-head" onClick={() => setOpenId(open ? null : m.id)} aria-expanded={open}>
                                        <span className="module-num">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="module-title">{m.title}</span>
                                        <ChevronDown aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        className={`module-tick${(doneIds ?? data.completedModuleIds).includes(m.id) ? ' on' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); void tick(m.id); }}
                                        disabled={(doneIds ?? data.completedModuleIds).includes(m.id) || marking === m.id}
                                        aria-pressed={(doneIds ?? data.completedModuleIds).includes(m.id)}
                                        title={(doneIds ?? data.completedModuleIds).includes(m.id) ? 'Completed' : 'Mark as complete'}
                                    >
                                        {marking === m.id ? (
                                            <Loader2 aria-hidden="true" className="spin" />
                                        ) : (doneIds ?? data.completedModuleIds).includes(m.id) ? (
                                            <CheckCircle2 aria-hidden="true" />
                                        ) : (
                                            <Circle aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                {open && (
                                    <div className="module-body">
                                        {!m.body?.trim() ? (
                                            <p className="auth-sub">Module notes are being prepared.</p>
                                        ) : (
                                            <ModuleText text={m.body} />
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}

            {data.recordings.length > 0 && (
                <section className="recordings">
                    <h2 className="learner-h">Session recordings</h2>
                    <div className="recording-grid">
                        {data.recordings.map((r: LearnerRecording) => {
                            const yt = youtubeId(r.url);
                            return yt ? (
                                <div key={r.id} className="learn-card recording-card">
                                    <div className="mod-yt">
                                        <iframe
                                            src={`https://www.youtube-nocookie.com/embed/${yt}`}
                                            title={r.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    </div>
                                    <strong>{r.title}</strong>
                                    {r.description && <p className="learn-meta">{r.description}</p>}
                                </div>
                            ) : (
                                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="learn-card recording-card recording-link">
                                    <strong>
                                        {r.title} <ExternalLink aria-hidden="true" width={13} height={13} />
                                    </strong>
                                    {r.description && <p className="learn-meta">{r.description}</p>}
                                    <span className="learn-meta">Open recording ↗</span>
                                </a>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
