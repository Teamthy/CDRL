'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Mail, Check, ClipboardList } from 'lucide-react';
import { adminFetch, type AdminCourse, UnauthorizedError } from '../../../lib/adminClient';

type Candidate = { name: string; email: string };
type Mode = 'exam-request' | 'credit-purchase';

const PECB_EXAMS_TO = 'exams@pecb.com';
const PECB_PM_TO = ''; // Partner manager — set per account

function parseCandidates(raw: string): Candidate[] {
    return raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [name = '', email = ''] = line.split(/[,\t;]/).map((p) => p.trim());
            return { name, email };
        })
        .filter((c) => c.name && c.email);
}

export default function PecExamRequestsPage() {
    const [courses, setCourses] = useState<AdminCourse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<'' | 'subject' | 'body'>('');
    const [mode, setMode] = useState<Mode>('exam-request');

    const [courseSlug, setCourseSlug] = useState('');
    const [trainer, setTrainer] = useState('');
    const [dates, setDates] = useState('');
    const [deliveryMode, setDeliveryMode] = useState('Virtual / Live Virtual');
    const [candidatesRaw, setCandidatesRaw] = useState('');
    const [examWindow, setExamWindow] = useState('');
    const [examFormat, setExamFormat] = useState('Online proctored');
    const [creditRef, setCreditRef] = useState('');
    const [creditCount, setCreditCount] = useState('10');

    useEffect(() => {
        adminFetch<AdminCourse[]>('/admin/courses')
            .then((rows) => {
                const pecb = rows.filter((c) => c.subtitle.includes('PECB'));
                setCourses(pecb);
                if (pecb.length) setCourseSlug(pecb[0].slug);
            })
            .catch((err) => {
                if (!(err instanceof UnauthorizedError)) setError(err.message);
            });
    }, []);

    const course = useMemo(() => courses.find((c) => c.slug === courseSlug) ?? null, [courses, courseSlug]);
    const candidates = useMemo(() => parseCandidates(candidatesRaw), [candidatesRaw]);

    const subject = useMemo(() => {
        if (mode === 'credit-purchase') {
            const code = course ? `${course.title} ${course.subtitle}` : '[Course]';
            return `Exam credit purchase — ${code} — ${creditCount || '[n]'} credits`;
        }
        const code = course ? `${course.title} ${course.subtitle}` : '[Course]';
        return `Exam request — ${code} — ${dates || '[dates]'} — ${candidates.length} candidate${candidates.length === 1 ? '' : 's'}`;
    }, [mode, course, creditCount, dates, candidates.length]);

    const body = useMemo(() => {
        if (mode === 'credit-purchase') {
            const code = course ? `${course.title} ${course.subtitle}` : '[Course code and title]';
            return [
                'Dear PECB Partner Team,',
                '',
                `We would like to purchase ${creditCount || '[n]'} exam credits for ${code} in support of our upcoming cohort${dates ? ` starting ${dates}` : ''}. Please advise current partner pricing for our partnership level, available payment methods, and expected crediting time.`,
                '',
                'Partner: Ykay Consulting Hub — Centre for Digital Risk & Leadership',
                'Partner ID: [your PECB Partner Account ID]',
                'Invoice to: [billing entity, address, TIN/VAT if applicable]',
                '',
                'Kind regards,',
                '[Name] · [Title]',
                'Ykay Consulting Hub · Centre for Digital Risk & Leadership',
                'info@ykayconsultinghub.com.ng',
            ].join('\n');
        }
        const code = course ? `${course.title} ${course.subtitle}` : '[Course code and title]';
        const rows = candidates.map((c, i) => `${i + 1}. ${c.name} — ${c.email} — ${code}`);
        return [
            'Dear PECB Exams Team,',
            '',
            `Following completion of our ${code} training course, delivered ${dates || '[dates]'} via ${deliveryMode}${trainer ? ` by ${trainer}` : ''}, we kindly request exam provisioning for the ${candidates.length} candidate${candidates.length === 1 ? '' : 's'} listed below.`,
            '',
            'Partner:      Ykay Consulting Hub — Centre for Digital Risk & Leadership',
            'Partner ID:   [your PECB Partner Account ID]',
            `PO/credit ref: ${creditRef || '[PO number or "exam credits — please advise balance"]'}`,
            '',
            'Candidate list (First/Last name | Email must match PECB profile | Course):',
            ...(rows.length ? rows : ['— paste candidates on the left —']),
            '',
            `Requested exam window: ${examWindow || '[date range]'}`,
            `Exam format: ${examFormat}`,
            '',
            'Please confirm receipt and the expected provisioning date so we can brief candidates on exam rules, scheduling, and system requirements.',
            '',
            'Kind regards,',
            '[Name] · Partnerships Lead',
            'Ykay Consulting Hub · Centre for Digital Risk & Leadership',
            'info@ykayconsultinghub.com.ng',
        ].join('\n');
    }, [mode, course, creditCount, dates, trainer, deliveryMode, candidates, examWindow, examFormat, creditRef]);

    const copy = async (which: 'subject' | 'body', text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
        setCopied(which);
        setTimeout(() => setCopied(''), 1500);
    };

    const mailto = `mailto:${mode === 'exam-request' ? PECB_EXAMS_TO : PECB_PM_TO || PECB_EXAMS_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <span className="kicker">PECB OPERATIONS</span>
                <h1>Exam &amp; credit requests</h1>
                <p className="admin-sub">
                    Compose PECB-ready exam provisioning and exam-credit purchase emails. Verify candidate emails match
                    their PECB profile, then copy or open in your mail client. Templates live in{' '}
                    <code>docs/PECB_OPS_PACK.md</code>.
                </p>
            </header>

            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}

            <div className="admin-filters" role="tablist" aria-label="Request type">
                {(['exam-request', 'credit-purchase'] as const).map((m) => (
                    <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
                        <ClipboardList aria-hidden="true" size={14} /> {m === 'exam-request' ? 'Exam provisioning' : 'Credit purchase'}
                    </button>
                ))}
            </div>

            <div className="pecb-exam-grid">
                <div className="pecb-exam-form">
                    <label className="admin-field admin-field-wide">
                        <span>Course</span>
                        <select value={courseSlug} onChange={(e) => setCourseSlug(e.target.value)}>
                            {courses.length === 0 && <option value="">— loading PECB courses —</option>}
                            {courses.map((c) => (
                                <option key={c.id} value={c.slug}>
                                    {c.title} {c.subtitle}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="admin-field">
                        <span>Course delivery dates</span>
                        <input value={dates} onChange={(e) => setDates(e.target.value)} placeholder="e.g. 22–26 Sep 2026" />
                    </label>
                    <label className="admin-field">
                        <span>Trainer</span>
                        <input value={trainer} onChange={(e) => setTrainer(e.target.value)} placeholder="Trainer name" />
                    </label>
                    {mode === 'exam-request' ? (
                        <>
                            <label className="admin-field">
                                <span>Delivery mode</span>
                                <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)}>
                                    <option>Virtual / Live Virtual</option>
                                    <option>In-person</option>
                                    <option>Hybrid</option>
                                </select>
                            </label>
                            <label className="admin-field">
                                <span>Exam window requested</span>
                                <input value={examWindow} onChange={(e) => setExamWindow(e.target.value)} placeholder="e.g. 5–12 Oct 2026" />
                            </label>
                            <label className="admin-field">
                                <span>Exam format</span>
                                <select value={examFormat} onChange={(e) => setExamFormat(e.target.value)}>
                                    <option>Online proctored</option>
                                    <option>Paper-based at partner site</option>
                                    <option>At PECB exam center</option>
                                </select>
                            </label>
                            <label className="admin-field">
                                <span>PO / credit reference</span>
                                <input value={creditRef} onChange={(e) => setCreditRef(e.target.value)} placeholder="Optional" />
                            </label>
                            <label className="admin-field admin-field-wide">
                                <span>Candidates (one per line: Full name, email)</span>
                                <textarea
                                    rows={8}
                                    value={candidatesRaw}
                                    onChange={(e) => setCandidatesRaw(e.target.value)}
                                    placeholder={'Adaeze Okafor, adaeze@example.com\nTunde Bello\ttunde@example.com'}
                                />
                            </label>
                        </>
                    ) : (
                        <label className="admin-field">
                            <span>Number of credits</span>
                            <input value={creditCount} onChange={(e) => setCreditCount(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
                        </label>
                    )}
                </div>

                <div className="pecb-exam-preview">
                    <div className="pecb-exam-row">
                        <span>Subject</span>
                        <p>{subject}</p>
                        <button className="pecb-btn" onClick={() => copy('subject', subject)} type="button">
                            {copied === 'subject' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />} Copy
                        </button>
                    </div>
                    <div className="pecb-exam-row">
                        <span>Body</span>
                        <pre>{body}</pre>
                        <div className="pecb-exam-actions">
                            <button className="pecb-btn" onClick={() => copy('body', body)} type="button">
                                {copied === 'body' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />} Copy body
                            </button>
                            <a className="pecb-btn" href={mailto}>
                                <Mail size={14} aria-hidden="true" /> Open in mail client
                            </a>
                        </div>
                    </div>
                    <small className="admin-sub">
                        Checks before sending: full attendance recorded · candidate emails match PECB profiles · credit balance/PO
                        covers {mode === 'exam-request' ? `${candidates.length} candidate(s)` : `${creditCount} credit(s)`} · current
                        PECB exam rules &amp; retake policy confirmed with your Partner Manager.
                    </small>
                </div>
            </div>
        </div>
    );
}
