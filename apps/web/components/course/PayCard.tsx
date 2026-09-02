'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import type { Course } from '../../lib/content';
import { getLearnerToken, learnerMe } from '../../lib/learnerClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function format(priceKobo: number, currency = 'NGN') {
    const naira = priceKobo / 100;
    return currency === 'NGN' ? `₦${naira.toLocaleString('en-NG')}` : `${currency} ${naira.toLocaleString()}`;
}

/** Paystack checkout card — rendered only when a course has a price set in the console. */
export default function PayCard({ course }: { course: Course }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prefill from an existing learner session when present.
    useState(() => {
        if (getLearnerToken()) {
            learnerMe()
                .then((me) => {
                    setEmail(me.user.email);
                    setName(me.user.name);
                })
                .catch(() => undefined);
        }
    });

    if (!course.priceKobo || course.priceKobo <= 0) return null;

    async function pay() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/payments/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseSlug: course.slug,
                    email: email.trim(),
                    name: name.trim() || undefined,
                }),
            });
            const body = (await res.json().catch(() => null)) as { authorizationUrl?: string; message?: string } | null;
            if (!res.ok || !body?.authorizationUrl) {
                throw new Error(body?.message ?? `Could not start checkout (${res.status})`);
            }
            window.location.assign(body.authorizationUrl);
        } catch (err) {
            setError((err as Error).message);
            setBusy(false);
        }
    }

    return (
        <div className="pay-card">
            <span className="apply-kicker">PAY &amp; ENROLL</span>
            <div className="pay-price">{format(course.priceKobo, course.currency)}</div>
            <label>
                Email for your account
                <input placeholder="Email for the payment receipt" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Name on the payment record (optional)" />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button type="button" className="auth-submit" disabled={busy || !email.trim()} onClick={() => void pay()}>
                <CreditCard aria-hidden="true" width={15} height={15} />
                {busy ? 'Opening secure checkout…' : 'Pay with Paystack'}
            </button>
            <small>Instant enrolment after payment. Card, transfer &amp; USSD supported.</small>
        </div>
    );
}
