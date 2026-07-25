'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { submitContact, type ContactSubmission } from '../../services/contact';

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
        try {
            const result = await submitContact(values);
            setStatus(result.ok ? 'success' : 'error');
        } catch {
            setStatus('error');
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
                    <option>Professional Training</option>
                    <option>Corporate Training</option>
                    <option>Advisory &amp; Consulting</option>
                    <option>Partnership</option>
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
                    <span className="error" style={{ marginLeft: 16 }}>
                        Something went wrong. Please try again.
                    </span>
                )}
            </div>
        </form>
    );
}