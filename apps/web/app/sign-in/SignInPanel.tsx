'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import {
    learnerForgotPassword,
    learnerResetPassword,
    learnerSignIn,
    learnerSignUp,
} from '../../lib/learnerClient';

type Mode = 'signin' | 'signup' | 'forgot';

function SignInPanelInner() {
    const params = useSearchParams();
    const resetToken = params.get('reset');

    if (resetToken) return <ResetForm token={resetToken} />;
    return <AuthForm />;
}

function AuthForm() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setNotice(null);
        const r =
            mode === 'signin'
                ? await learnerSignIn(email.trim(), password)
                : mode === 'signup'
                  ? await learnerSignUp(name.trim(), email.trim(), password)
                  : await learnerForgotPassword(email.trim());
        setBusy(false);
        if (!r.ok) {
            setError(r.message ?? 'Something went wrong');
            return;
        }
        if (mode === 'forgot') {
            setNotice(r.message ?? 'If an account exists for that email, a reset link is on its way.');
        } else {
            router.replace('/learner');
        }
    }

    return (
        <div className="auth-card">
            <span className="auth-mark"><GraduationCap aria-hidden="true" /></span>
            <h1>{mode === 'forgot' ? 'Reset your password' : mode === 'signup' ? 'Create your learner account' : 'Welcome back'}</h1>
            <p className="auth-sub">
                {mode === 'forgot'
                    ? 'Enter your account email — we will send a reset link (valid 30 minutes).'
                    : mode === 'signup'
                      ? 'One account for your courses, progress and certificates.'
                      : 'Sign in to view your enrolments, progress and materials.'}
            </p>

            <form onSubmit={onSubmit} className="auth-form">
                {mode === 'signup' && (
                    <label>
                        Full name
                        <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" minLength={2} />
                    </label>
                )}
                <label>
                    Email
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </label>
                {mode !== 'forgot' && (
                    <label>
                        Password
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            minLength={8}
                        />
                    </label>
                )}
                {error && <p className="auth-error" role="alert">{error}</p>}
                {notice && <p className="auth-notice" role="status">{notice}</p>}
                <button type="submit" className="auth-submit" disabled={busy}>
                    {busy ? 'One moment…' : mode === 'forgot' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
            </form>

            <div className="auth-switch">
                {mode === 'signin' && (
                    <>
                        <button type="button" onClick={() => setMode('forgot')}>Forgot password?</button>
                        <span>·</span>
                        <button type="button" onClick={() => setMode('signup')}>New here? Create an account</button>
                    </>
                )}
                {mode === 'signup' && <button type="button" onClick={() => setMode('signin')}>Already have an account? Sign in</button>}
                {mode === 'forgot' && <button type="button" onClick={() => setMode('signin')}>← Back to sign in</button>}
            </div>
        </div>
    );
}

function ResetForm({ token }: { token: string }) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setBusy(true);
        setError(null);
        const r = await learnerResetPassword(token, password);
        setBusy(false);
        if (!r.ok) {
            setError(r.message ?? 'Reset failed — request a new link.');
            return;
        }
        router.replace('/sign-in');
    }

    return (
        <div className="auth-card">
            <span className="auth-mark"><GraduationCap aria-hidden="true" /></span>
            <h1>Choose a new password</h1>
            <p className="auth-sub">At least 8 characters.</p>
            <form onSubmit={onSubmit} className="auth-form">
                <label>
                    New password
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} />
                </label>
                <label>
                    Confirm password
                    <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} />
                </label>
                {error && <p className="auth-error" role="alert">{error}</p>}
                <button type="submit" className="auth-submit" disabled={busy}>
                    {busy ? 'Saving…' : 'Set new password'}
                </button>
            </form>
        </div>
    );
}

export default function SignInPanel() {
    return (
        <Suspense fallback={null}>
            <SignInPanelInner />
        </Suspense>
    );
}
