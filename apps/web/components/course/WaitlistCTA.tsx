'use client';

import { useState, type FormEvent } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = { course: Course };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** "Notify me when this runs next" (elective #8, light): posts to /enquiries so it lands in the CRM. */
export default function WaitlistCTA({ course }: Props) {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

    async function submit(e: FormEvent) {
        e.preventDefault();
        setState('busy');
        try {
            const res = await fetch(`${API_BASE}/enquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Waitlist subscriber',
                    email: email.trim(),
                    interest: 'Professional Training',
                    message: `WAITLIST: ${course.title} ${course.subtitle} (${course.slug})`,
                }),
            });
            if (!res.ok) throw new Error(String(res.status));
            setState('done');
        } catch {
            setState('error');
        }
    }

    if (state === 'done') {
        return (
            <div className="waitlist waitlist-done" role="status">
                <CheckCircle2 aria-hidden="true" /> We will email <strong>{email}</strong> when the next cohort opens.
            </div>
        );
    }

    return (
        <form className="waitlist" onSubmit={submit}>
            <Bell aria-hidden="true" />
            <span>Join the waitlist for the next cohort</span>
            <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organisation.com"
                aria-label="Email for waitlist notification"
            />
            <button type="submit" disabled={state === 'busy'}>
                {state === 'busy' ? 'Joining…' : 'Notify me'}
            </button>
            {state === 'error' && <small role="alert">Something failed — email info@ykayconsultinghub.com.ng</small>}
        </form>
    );
}
