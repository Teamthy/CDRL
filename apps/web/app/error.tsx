'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';
import SiteLayout from '../components/SiteLayout';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function RouteError({ error, reset }: Props) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('CDRL route error:', error);
    }, [error]);

    return (
        <SiteLayout>
            <section
                style={{
                    background: 'var(--cdrl-black)',
                    color: 'var(--cdrl-text-light)',
                    padding: '120px 0 140px',
                    minHeight: '60vh',
                }}
            >
                <div className="wrap">
                    <span className="kicker">UNEXPECTED ERROR</span>
                    <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', margin: '16px 0 22px', maxWidth: 700 }}>
                        Something went wrong loading this page.
                    </h1>
                    <p style={{ maxWidth: 600, opacity: 0.8, lineHeight: 1.7, marginBottom: 32 }}>
                        You can retry the page or return home. If the issue continues, please contact our team.
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button type="button" onClick={reset} className="btn btn-primary">
                            <span>Try again</span>
                            <RefreshCcw size={16} />
                        </button>
                        <Link href={'/' as any} className="btn btn-secondary">
                            <span>Back to home</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}