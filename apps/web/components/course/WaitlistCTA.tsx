'use client';

import { useState, type FormEvent } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import type { Course } from '../../lib/content';
import { submitWaitlist } from '../../lib/enquiries';

type Props = { course: Course };

/** "Notify me when this runs next". Submitted as a contact enquiry, so it lands in the CRM. */
export default function WaitlistCTA({ course }: Props) {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

    async function submit(e: FormEvent) {
        e.preventDefault();
        setState('busy');
        const result = await submitWaitlist(course, email);
        setState(result.ok ? 'done' : 'error');
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
