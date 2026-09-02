import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, PackageOpen } from 'lucide-react';
import SiteLayout from '../../../components/SiteLayout';
import ModuleText from '../../../components/learn/ModuleText';
import { fetchBundle, fetchBundles } from '../../../lib/api';

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    const bundles = await fetchBundles().catch(() => null);
    return (bundles ?? []).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const bundle = await fetchBundle(slug);
    if (!bundle) return { title: 'Bundle not found' };
    return {
        title: `${bundle.title} — ${bundle.subtitle}`,
        description: bundle.overview,
        alternates: { canonical: `/bundles/${bundle.slug}` },
    };
}

function price(b: { priceKobo?: number | null; currency?: string }) {
    if (!b.priceKobo) return null;
    const n = b.priceKobo / 100;
    return (b.currency ?? 'NGN') === 'NGN' ? `₦${n.toLocaleString('en-NG')}` : `${b.currency} ${n.toLocaleString()}`;
}

export default async function BundleDetailPage({ params }: Props) {
    const { slug } = await params;
    const bundle = await fetchBundle(slug);
    if (!bundle) notFound();
    const p = price(bundle);

    return (
        <SiteLayout>
            <section className="trainer-hero bundle-hero">
                <div className="wrap">
                    <Link href="/bundles" className="back">
                        <ArrowLeft aria-hidden="true" /> All bundles
                    </Link>
                    <span className="kicker">
                        <PackageOpen aria-hidden="true" /> {bundle.subtitle}
                    </span>
                    <h1>{bundle.title}</h1>
                    <p className="trainer-bio">{bundle.overview}</p>
                    {bundle.savingsNote && <p className="bundle-save-lg">{bundle.savingsNote}</p>}
                </div>
            </section>
            <section className="trainer-courses">
                <div className="wrap bundle-detail-grid">
                    <div>
                        <h2>This bundle includes</h2>
                        <div className="trainer-courses-grid">
                            {(bundle.courses ?? []).map((bc, i) => (
                                <Link key={bc.course.slug} href={`/training/${bc.course.slug}` as Route} className="trainer-course-card">
                                    <span className="kicker">Pathway {i + 1}</span>
                                    <strong>{bc.course.title}</strong>
                                    <em>{bc.course.subtitle}</em>
                                </Link>
                            ))}
                        </div>
                        {bundle.details ? (
                            <div className="course-details" style={{ marginTop: 24 }}>
                                <ModuleText text={bundle.details} anchorIds />
                            </div>
                        ) : null}
                    </div>
                    <aside className="bundle-buy">
                        <span className="kicker">PACKAGE</span>
                        <h4>{bundle.courses?.length ?? 0} courses · one schedule</h4>
                        {p ? (
                            <p className="bundle-price-lg">{p}</p>
                        ) : (
                            <p className="bundle-price-lg">Group quote</p>
                        )}
                        <ul className="bundle-includes">
                            <li><Check aria-hidden="true" /> All course materials</li>
                            <li><Check aria-hidden="true" /> All certification exams</li>
                            <li><Check aria-hidden="true" /> Dedicated cohort scheduling</li>
                            <li><Check aria-hidden="true" /> Employer-friendly invoice documentation</li>
                        </ul>
                        <Link className="bundle-cta" href="/corporate-training">
                            Request this package
                        </Link>
                        <small>or email info@ykayconsultinghub.com.ng</small>
                    </aside>
                </div>
            </section>
        </SiteLayout>
    );
}
