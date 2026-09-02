'use client';

import { useState } from 'react';
import { Briefcase, Download, ExternalLink } from 'lucide-react';

type Props = { courseTitle: string };

/** PECB-style "Need support for your career development? Download a request letter
 *  to ask your employer for funding" widget on course pages. The letter is a
 *  printable HTML letter branded for Ykay + the specific course. */
export default function EmployerFunding({ courseTitle }: Props) {
    const [name, setName] = useState('');
    const [employer, setEmployer] = useState('');
    const [role, setRole] = useState('');
    const [open, setOpen] = useState(false);

    const letter = [
        `Date: ${new Date().toLocaleDateString('en-GB')}`,
        '',
        `To: ${employer || '[Employer / Line Manager]'} `,
        '',
        'Subject: Support request for professional certification',
        '',
        'Dear ' + (employer || '[Employer]') + ',',
        '',
        `I am writing to request support to attend "${courseTitle}", delivered by Ykay Consulting Hub (Centre for Digital Risk & Leadership), a PECB Authorized Partner in Lagos, Nigeria.`,
        role ? `As ${role}, ` : '',
        'this programme develops immediately usable capability that benefits our organization: structured, internationally recognized practice, an exam-based credential verifiable on the PECB website, and official course materials I will retain for internal knowledge sharing.',
        '',
        'I would welcome the opportunity to discuss how this aligns with our team goals. Provider details: Ykay Consulting Hub — info@ykayconsultinghub.com.ng — https://ykayconsultinghub.com.ng.',
        '',
        'Thank you for considering this request.',
        '',
        'Kind regards,',
        name || '[Your name]',
    ].join('\n');

    function download() {
        const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employer-funding-request.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    function openPrint() {
        const w = window.open('', '_blank', 'noopener');
        if (!w) return;
        const esc = letter.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        w.document.write(
            '<!doctype html><title>Employer funding request</title>' +
                '<style>body{font-family:Georgia,serif;max-width:660px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1c1f1e}pre{white-space:pre-wrap;font:inherit}</style>' +
                `<pre>${esc}</pre><script>window.print()</script>`,
        );
        w.document.close();
    }

    return (
        <aside className="funding-card" id="funding">
            <span className="funding-kicker">EMPLOYER SUPPORT</span>
            <h4>Ask your employer to fund this</h4>
            <p>Personalize and download a ready-made request letter, just as PECB partners provide.</p>
            <button type="button" className="funding-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                <Briefcase aria-hidden="true" /> {open ? 'Close builder' : 'Build my letter'}
            </button>
            {open && (
                <div className="funding-form">
                    <label>
                        <span>Your name</span>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adaeze Okafor" />
                    </label>
                    <label>
                        <span>Employer / manager</span>
                        <input value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder="Head of IT, Acme Ltd" />
                    </label>
                    <label>
                        <span>Your role (optional)</span>
                        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="IT Security Analyst" />
                    </label>
                    <div className="funding-actions">
                        <button type="button" onClick={download}>
                            <Download aria-hidden="true" /> Download .txt
                        </button>
                        <button type="button" onClick={openPrint}>
                            <ExternalLink aria-hidden="true" /> Print / PDF
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
