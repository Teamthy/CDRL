'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, BookOpen, Compass, Rocket } from 'lucide-react';
import {
    LearnerUnauthorizedError,
    learnerMe,
    type LearnerMe,
} from '../../../lib/learnerClient';

const STEPS = [
    {
        icon: Rocket,
        title: 'Your account is live',
        body: 'This is your personal portal. From here you can open every course you are enrolled in, tick off modules, and download your completion certificates.',
    },
    {
        icon: BookOpen,
        title: 'How learning works here',
        body: 'Each course is split into numbered modules. Open one, mark it complete when you finish, and your progress bar moves forward. At 100% the certificate unlocks.',
    },
    {
        icon: Compass,
        title: 'Stuck or unsure?',
        body: 'Admissions and your tutor are one email away — info@ykayconsultinghub.com.ng. Corporate learners can also reach their team coordinator.',
    },
];

/** First-run onboarding carousel — one screen, one step at a time, then the dashboard. */
export default function OnboardingFlow() {
    const router = useRouter();
    const [me, setMe] = useState<LearnerMe | null>(null);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        learnerMe()
            .then((m) => {
                setMe(m);
                if (m.user.onboardedAt) router.replace('/learner'); // already onboarded → straight to dashboard
            })
            .catch((err) => {
                if (err instanceof LearnerUnauthorizedError) router.replace('/sign-in');
                else setError((err as Error).message);
            });
    }, [router]);

    async function finish() {
        setSaving(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/learner/me/complete-onboarding`, {
                method: 'POST',
                credentials: 'include',
                headers: { Authorization: `Bearer ${localStorage.getItem('ykh_learner_token')}` },
            });
            router.replace('/learner');
        } catch {
            setError('Could not save — try again.');
            setSaving(false);
        }
    }

    if (error) return <p className="auth-error" role="alert">{error}</p>;
    if (!me) return <p className="auth-sub">Preparing your portal…</p>;

    const Step = STEPS[step]!;
    const last = step === STEPS.length - 1;
    return (
        <div className="onboard-card" role="main">
            <span className="kicker">WELCOME, {me.user.name.split(' ')[0]!.toUpperCase()}</span>
            <h1>Let&rsquo;s get you set up.</h1>

            <ol className="onboard-dots" aria-label="Onboarding steps">
                {STEPS.map((_, i) => (
                    <li key={i} className={i === step ? 'on' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined} />
                ))}
            </ol>

            <div className="onboard-step" key={step}>
                <Step.icon aria-hidden="true" />
                <h2>{Step.title}</h2>
                <p>{Step.body}</p>
            </div>

            <div className="onboard-actions">
                {last ? (
                    <>
                        <button type="button" className="auth-primary" onClick={finish} disabled={saving}>
                            <BadgeCheck aria-hidden="true" /> {saving ? 'Saving…' : 'Finish — open my dashboard'}
                        </button>
                        <Link href={'/training' as Route} className="auth-ghost">
                            <BookOpen aria-hidden="true" /> Browse the catalogue
                        </Link>
                    </>
                ) : (
                    <button type="button" className="auth-primary" onClick={() => setStep((i) => i + 1)}>
                        Next <ArrowRight aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
}
