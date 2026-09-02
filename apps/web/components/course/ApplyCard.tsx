'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import type { Course } from '../../lib/content';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const BACKGROUNDS = [
    'Student / recent graduate',
    'Working professional',
    'Career switcher',
    'Manager / executive',
    'Business owner',
] as const;

type Props = { course: Course };

/**
 * "Apply for this training" card on course detail pages.
 * Posts to POST /api/v1/applications (saved to the CRM + email alert).
 */
export default function ApplyCard({ course }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [background, setBackground] = useState<string>(BACKGROUNDS[1]);
    const [message, setMessage] = useState('');
    const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
    const [errorText, setErrorText] = useState('');

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setState('busy');
        setErrorText('');
        try {
            const res = await fetch(`${API_BASE}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim() || undefined,
                    background,
                    message: message.trim() || undefined,
                    courseSlug: course.slug,
                    courseTitle: course.title,
                    track: course.track,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Something went wrong (${res.status})`);
            }
            setState('done');
        } catch (err) {
            setErrorText((err as Error).message);
            setState('error');
        }
    }

    if (state === 'done') {
        return (
            <div className="apply-card apply-done">
                <CheckCircle2 />
                <h4>Application received.</h4>
                <p>
                    Thank you, {name.split(' ')[0]} — our team will review your application for{' '}
                    <strong>{course.title}</strong> and reach out within two business days with enrollment details.
                </p>
            </div>
        );
    }

    return (
        <form className="apply-card" onSubmit={onSubmit}>
            <span className="apply-kicker">APPLY NOW</span>
            <h4>Apply for this training</h4>
            <p className="apply-sub">
                Reserve a place in {course.title}. No payment now — we confirm details first.
            </p>
            <label>
                Full name
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your full name" />
            </label>
            <label>
                Email
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@organisation.com" />
            </label>
            <label>
                Phone (optional)
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+234 …" />
            </label>
            <label>
                Your background
                <select value={background} onChange={(e) => setBackground(e.target.value)}>
                    {BACKGROUNDS.map((b) => (
                        <option key={b}>{b}</option>
                    ))}
                </select>
            </label>
            <label>
                Anything we should know? (optional)
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Group size, preferred dates, employer sponsorship…" />
            </label>
            {state === 'error' && (
                <p className="admin-error" role="alert">
                    {errorText}
                </p>
            )}
            <button type="submit" disabled={state === 'busy'} className="apply-submit">
                <Send />
                {state === 'busy' ? 'Submitting…' : 'Submit application'}
            </button>
        </form>
    );
}
