import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, PackageOpen } from 'lucide-react';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import { fetchBundles } from '../../lib/api';

export const revalidate = 1800;

export const metadata = {
    title: 'Certification Bundles',
    description: 'Train & certify on multiple programmes at once — packaged pathways with built-in savings.',
    alternates: { canonical: '/bundles' },
};

function price(b: { priceKobo?: number | null; currency?: string }) {
    if (!b.priceKobo) return 'Request a quote';
    const n = b.priceKobo / 100;
    return (b.currency ?? 'NGN') === 'NGN' ? `₦${n.toLocaleString('en-NG')}` : `${b.currency} ${n.toLocaleString()}`;
}

export default async function BundlesPage() {
    const bundles = await fetchBundles();
    return (
        <SiteLayout>
            <PageHero
                eyebrow="BUNDLED PATHWAYS"
                title="Train & certify more, pay less."
                description="Multi-course packages that stack credentials across a career path — one invoice, one schedule, built-in savings."
            />
            <section className="bundle-index">
                <div className="wrap">
                    {!bundles || bundles.length === 0 ? (
                        <div className="empty-state">
                            <PackageOpen aria-hidden="true" />
                            <p>Bundles publish soon — check back, or contact us for a custom package.</p>
                        </div>
                    ) : (
                        <div className="bundle-grid">
                            {bundles.map((b) => (
                                <Link key={b.id} href={`/bundles/${b.slug}` as Route} className="bundle-card">
                                    <span className="kicker">{b.subtitle}</span>
                                    <h3>{b.title}</h3>
                                    <p>{b.overview}</p>
                                    <div className="bundle-foot">
                                        <span className="bundle-price">{price(b)}</span>
                                        <span className="bundle-count">{b.courseCount ?? b.courses?.length ?? 0} courses</span>
                                        {b.savingsNote && <span className="bundle-save">{b.savingsNote}</span>}
                                    </div>
                                    <span className="trainer-go">
                                        View bundle <ArrowRight aria-hidden="true" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}
