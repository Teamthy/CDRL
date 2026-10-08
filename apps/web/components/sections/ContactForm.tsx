'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { submitContact, type ContactSubmission } from '../../services/contact';
import { INTEREST_OPTIONS, resolveInterest } from '../../lib/contactInterest';

type FormState = ContactSubmission & { email: string };
type Errors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
    name: '',
    organization: '',
    email: '',
    interest: '',
    message: '',
};

export default function ContactForm() {
    const [values, setValues] = useState<FormState>(initial);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    /** Why the submission failed, as reported by the service. */
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    /** A referred interest that is not one of the fixed options (e.g. an event). */
    const [referredInterest, setReferredInterest] = useState<string | null>(null);

    // Prefill from ?interest= — the events page has always sent it (audit UX-17).
    useEffect(() => {
        const interest = resolveInterest(new URLSearchParams(window.location.search).get('interest'));
        if (!interest) return;
        setValues((prev) => ({ ...prev, interest }));
        if (!INTEREST_OPTIONS.some((o) => o === interest)) setReferredInterest(interest);
    }, []);

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function validate(): boolean {
        const next: Errors = {};
        if (!values.name.trim()) next.name = 'Please enter your name.';
        if (!values.email.trim()) next.email = 'Please enter your email.';
        else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Please enter a valid email.';
        if (!values.interest) next.interest = 'Please choose an area of interest.';
        if (!values.message.trim()) next.message = 'Please add a short message.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setStatus('submitting');
        setErrorMessage(null);
        try {
            // submitContact already distinguishes "we could not reach the
            // server" from "you are being rate limited"; throwing that away and
            // always printing "Something went wrong" told the user to retry
            // immediately in the one case where retrying cannot work.
            const result = await submitContact(values);
            setStatus(result.ok ? 'success' : 'error');
            if (!result.ok) setErrorMessage(result.message ?? null);
        } catch {
            setStatus('error');
            setErrorMessage(null);
        }
    }

    if (status === 'success') {
        return (
            <div className="contact-success" role="status" aria-live="polite">
                <Check aria-hidden="true" />
                <h2>Thank you.</h2>
                <p>Your message has been received. Our team will respond shortly.</p>
            </div>
        );
    }

    return (
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label>
                <span>Name</span>
                <input
                    required
                    value={values.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Your full name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'err-name' : undefined}
                />
                {errors.name && <span id="err-name" className="error">{errors.name}</span>}
            </label>

            <label>
                <span>Organization</span>
                <input
                    value={values.organization ?? ''}
                    onChange={(e) => set('organization', e.target.value)}
                    placeholder="Company or institution"
                />
            </label>

            <label>
                <span>Email</span>
                <input
                    type="email"
                    required
                    value={values.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="you@organisation.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'err-email' : undefined}
                />
                {errors.email && <span id="err-email" className="error">{errors.email}</span>}
            </label>

            <label>
                <span>Interest</span>
                <select
                    required
                    value={values.interest}
                    onChange={(e) => set('interest', e.target.value)}
                    aria-invalid={!!errors.interest}
                    aria-describedby={errors.interest ? 'err-interest' : undefined}
                >
                    <option value="">Select an area</option>
                    {/* Keeps the referring event on the enquiry instead of
                        silently dropping it back to "Select an area". */}
                    {referredInterest && <option value={referredInterest}>{referredInterest}</option>}
                    {INTEREST_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {errors.interest && <span id="err-interest" className="error">{errors.interest}</span>}
            </label>

            <label className="full">
                <span>Message</span>
                <textarea
                    required
                    rows={6}
                    value={values.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="How can we help?"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'err-message' : undefined}
                />
                {errors.message && <span id="err-message" className="error">{errors.message}</span>}
            </label>

            <div className="submit-row">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === 'submitting'}
                >
                    <span>{status === 'submitting' ? 'Sending…' : 'Send Enquiry'}</span>
                    <ArrowRight />
                </button>
                {status === 'error' && (
                    <span className="error" style={{ marginLeft: 16 }} role="alert">
                        {errorMessage ?? 'Something went wrong. Please try again.'}
                    </span>
                )}
            </div>
        </form>
    );
}