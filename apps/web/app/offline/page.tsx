import type { Metadata } from 'next';
import Link from 'next/link';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';

export const metadata: Metadata = {
    title: 'You are offline',
    robots: { index: false, follow: false },
};

export default function OfflinePage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="CONNECTION"
                title="You are offline."
                description="This page needs a connection. Pages you visited before may still open from cache — or reconnect and try again."
            />
            <section className="pr-article">
                <div className="wrap">
                    <p>
                        <Link href="/" className="text-link">← Back to home</Link>
                    </p>
                </div>
            </section>
        </SiteLayout>
    );
}
