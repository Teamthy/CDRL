import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteLayout from '../components/SiteLayout';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
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
                    <span className="kicker">404</span>
                    <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', margin: '16px 0 22px', maxWidth: 700 }}>
                        We couldn&apos;t find that page.
                    </h1>
                    <p style={{ maxWidth: 600, opacity: 0.8, lineHeight: 1.7, marginBottom: 32 }}>
                        The page you tried to reach may have moved, or the link may be out of date. Explore our
                        training or return to the homepage below.
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link href={'/'} className="btn btn-primary">
                            <span>Back to home</span>
                            <ArrowRight />
                        </Link>
                        <Link href={'/training'} className="btn btn-secondary">
                            <span>Explore training</span>
                        </Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}