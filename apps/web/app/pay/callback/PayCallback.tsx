'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

type Outcome = { status: 'loading' } | { status: 'success'; courseSlug: string } | { status: 'failed' } | { status: 'error'; message: string };

export default function PayCallback() {
    const params = useSearchParams();
    const reference = params.get('reference') ?? params.get('trxref');
    const [outcome, setOutcome] = useState<Outcome>({ status: 'loading' });

    useEffect(() => {
        if (!reference) {
            setOutcome({ status: 'error', message: 'No payment reference in the link.' });
            return;
        }
        fetch(`${API_BASE}/payments/verify/${encodeURIComponent(reference)}`)
            .then(async (res) => {
                const body = (await res.json().catch(() => null)) as { status?: string; courseSlug?: string; message?: string } | null;
                if (!res.ok) throw new Error(body?.message ?? `Verification failed (${res.status})`);
                if (body?.status === 'success' && body.courseSlug) {
                    setOutcome({ status: 'success', courseSlug: body.courseSlug });
                } else {
                    setOutcome({ status: 'failed' });
                }
            })
            .catch((err) => setOutcome({ status: 'error', message: (err as Error).message }));
    }, [reference]);

    if (outcome.status === 'loading') return <p className="auth-sub">Confirming your payment…</p>;

    return (
        <div className="auth-card">
            {outcome.status === 'success' && (
                <>
                    <h1>Payment confirmed 🎉</h1>
                    <p className="auth-sub">
                        You are enrolled. Sign in (or create your account with the same email) to open your modules.
                    </p>
                    <Link href={`/learner/${outcome.courseSlug}` as Route} className="auth-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
                        Open my course
                    </Link>
                    <div className="auth-switch">
                        <Link href={'/learner' as Route}>My learning</Link>
                        <span>·</span>
                        <Link href={'/sign-in' as Route}>Sign in</Link>
                    </div>
                </>
            )}
            {outcome.status === 'failed' && (
                <>
                    <h1>Payment not completed</h1>
                    <p className="auth-sub">No charge was made (or it was reversed). You can try again from the course page.</p>
                    <Link href={'/training' as Route} className="text-link"><span>← Back to courses</span></Link>
                </>
            )}
            {outcome.status === 'error' && (
                <>
                    <h1>Something went wrong</h1>
                    <p className="auth-error" role="alert">{outcome.message}</p>
                    <Link href={'/contact' as Route} className="text-link"><span>Contact us with your receipt reference</span></Link>
                </>
            )}
        </div>
    );
}
