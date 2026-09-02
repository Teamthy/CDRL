'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { adminLogin } from '../../../lib/adminClient';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const result = await adminLogin(email.trim(), password);
        setBusy(false);
        if (result.ok) {
            router.replace('/admin');
        } else {
            setError(result.message ?? 'Login failed');
        }
    }

    return (
        <div className="admin-login">
            <form className="admin-login-card" onSubmit={onSubmit}>
                <div className="admin-brand admin-login-brand">
                    <span className="admin-brand-mark">Y</span>
                    <div>
                        <strong>YKAY Console</strong>
                        <span>Ykay Consulting Hub</span>
                    </div>
                </div>
                <h1>Sign in</h1>
                <label>
                    Email
                    <input
                        type="email"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        required
                        minLength={10}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}
                <button type="submit" disabled={busy}>
                    <Lock />
                    {busy ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
