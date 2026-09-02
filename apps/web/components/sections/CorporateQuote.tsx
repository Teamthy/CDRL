'use client';

import { useState, type FormEvent } from 'react';
import { Building2, CheckCircle2, Send } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SIZES = ['2–5 people', '6–15 people', '16–50 people', '50+ people'] as const;

/** Corporate training quote request (elective #6): structured B2B form posting to /enquiries. */
export default function CorporateQuote() {
    const [company, setCompany] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [teamSize, setTeamSize] = useState<string>(SIZES[1]);
    const [focus, setFocus] = useState('');
    const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

    async function submit(e: FormEvent) {
        e.preventDefault();
        setState('busy');
        try {
            const res = await fetch(`${API_BASE}/enquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${name.trim()} — ${company.trim()}`,
                    email: email.trim(),
                    interest: 'Corporate Training',
                    message: `Team size: ${teamSize}. Training focus: ${focus.trim()}`,
                }),
            });
            if (!res.ok) throw new Error(`(${res.status})`);
            setState('done');
        } catch {
            setState('error');
        }
    }

    if (state === 'done') {
        return (
            <div className="corp-quote corp-done" role="status">
                <CheckCircle2 aria-hidden="true" />
                <h4>Proposal request received.</h4>
                <p>We will reach out to {email} with a tailored program outline and group pricing.</p>
            </div>
        );
    }

    return (
        <form className="corp-quote" onSubmit={submit}>
            <span className="kicker">FOR TEAMS</span>
            <h4>Corporate training quote</h4>
            <p>Group pricing, custom schedules, on-site or virtual delivery for your whole team.</p>
            <div className="corp-quote-grid">
                <label>
                    Company
                    <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Organization name" />
                </label>
                <label>
                    Contact person
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                </label>
                <label>
                    Email
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                </label>
                <label>
                    Team size
                    <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
                        {SIZES.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </label>
            </div>
            <label>
                Training focus
                <textarea
                    rows={2}
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="e.g. ISO/IEC 27001 implementation for our compliance team, or a mix of cybersecurity fundamentals for all staff"
                />
            </label>
            {state === 'error' && <p className="admin-error" role="alert">Could not send — please email info@ykayconsultinghub.com.ng instead.</p>}
            <button type="submit" className="corp-quote-submit" disabled={state === 'busy'}>
                <Send aria-hidden="true" /> {state === 'busy' ? 'Sending…' : 'Request quote'}
            </button>
            <small className="corp-quote-note">
                <Building2 aria-hidden="true" /> Trusted by teams across Africa · invoicing with proper documentation
            </small>
        </form>
    );
}
