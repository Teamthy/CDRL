'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('CDRL global error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0, background: '#000000', color: '#FFF7E4', fontFamily: 'DM Sans, sans-serif' }}>
                <section style={{ padding: '120px 24px 140px', minHeight: '80vh' }}>
                    <div style={{ maxWidth: 1184, margin: '0 auto' }}>
                        <span
                            style={{
                                color: '#70F250',
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.17em',
                            }}
                        >
                            SOMETHING WENT WRONG
                        </span>
                        <h1
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 500,
                                fontSize: 'clamp(40px, 5vw, 60px)',
                                letterSpacing: '-0.045em',
                                margin: '16px 0 22px',
                                lineHeight: 1.05,
                            }}
                        >
                            An unexpected error occurred.
                        </h1>
                        <p style={{ maxWidth: 600, opacity: 0.8, lineHeight: 1.7, marginBottom: 32 }}>
                            Please try again. If the problem persists, contact our team at{' '}
                            <a href="mailto:training@cdrl.africa" style={{ color: '#70F250' }}>
                                training@cdrl.africa
                            </a>
                            .
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={reset}
                                style={{
                                    background: '#70F250',
                                    color: '#000000',
                                    border: 0,
                                    padding: '15px 22px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    cursor: 'pointer',
                                }}
                            >
                                <span>Try again</span>
                                <RefreshCcw size={16} />
                            </button>
                            <Link
                                href={'/' as any}
                                style={{
                                    color: '#70F250',
                                    border: '1px solid #70F250',
                                    padding: '15px 22px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    textDecoration: 'none',
                                }}
                            >
                                <span>Back to home</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            </body>
        </html>
    );
}