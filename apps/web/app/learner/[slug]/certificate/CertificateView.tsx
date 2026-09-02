'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';
import { LearnerUnauthorizedError, learnerMe, type LearnerEnrollment } from '../../../../lib/learnerClient';

/** Printable completion certificate — available once the admin marks the enrollment completed. */
export default function CertificateView({ slug }: { slug: string }) {
    const router = useRouter();
    const [row, setRow] = useState<{ name: string; enrollment: LearnerEnrollment } | null>(null);
    const [problem, setProblem] = useState<'loading' | 'not-completed' | 'error'>('loading');

    useEffect(() => {
        learnerMe()
            .then((me) => {
                const enrollment = me.enrollments.find((e) => e.course.slug === slug);
                if (!enrollment || enrollment.status !== 'completed') {
                    setProblem('not-completed');
                    return;
                }
                setRow({ name: me.user.name, enrollment });
            })
            .catch((err) => {
                if (err instanceof LearnerUnauthorizedError) router.replace('/sign-in');
                else setProblem('error');
            });
    }, [slug, router]);

    if (problem === 'loading') return <p className="auth-sub">Checking your certificate…</p>;
    if (problem === 'error') return <p className="auth-error" role="alert">Could not load the certificate. Try again shortly.</p>;
    if (problem === 'not-completed' || !row) {
        return (
            <div className="auth-card">
                <h1>Certificate not issued yet</h1>
                <p className="auth-sub">
                    Certificates unlock when the school marks your enrolment as completed. Keep going — you&apos;re nearly there.
                </p>
                <Link href={`/learner/${slug}` as Route} className="text-link"><span>← Back to modules</span></Link>
            </div>
        );
    }

    const issued = row.enrollment.updatedAt
        ? new Date(row.enrollment.updatedAt).toLocaleDateString('en-NG', { dateStyle: 'long' })
        : null;
    const verifyId = row.enrollment.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();

    return (
        <div className="cert-page">
            <div className="cert-actions">
                <Link href={`/learner/${slug}` as Route} className="auth-ghost">← Back to course</Link>
                <button type="button" className="auth-submit cert-print" onClick={() => window.print()}>
                    <Printer aria-hidden="true" width={15} height={15} /> Print / Save as PDF
                </button>
            </div>

            <div className="cert-sheet" role="img" aria-label={`Certificate of completion for ${row.name}`}>
                <div className="cert-band" />
                <div className="cert-inner">
                    <div className="cert-brand">
                        <span className="admin-brand-mark">Y</span>
                        <div>
                            <strong>Ykay Consulting Hub</strong>
                            <span>Centre for Digital Risk &amp; Leadership (CDRL)</span>
                        </div>
                    </div>
                    <p className="cert-kicker">CERTIFICATE OF COMPLETION</p>
                    <p className="cert-this-to">This is to certify that</p>
                    <h1 className="cert-name">{row.name}</h1>
                    <p className="cert-has">has successfully completed the professional training program</p>
                    <h2 className="cert-course">{row.enrollment.course.title}</h2>
                    <div className="cert-meta">
                        {issued && <span>Issued {issued}</span>}
                        <span>Verification ID: <code>{verifyId}</code></span>
                    </div>
                </div>
                <div className="cert-band cert-band-bottom" />
            </div>
            <p className="learner-note">Employers can quote the verification ID to admissions@ykayconsultinghub.com.ng for confirmation.</p>
        </div>
    );
}
