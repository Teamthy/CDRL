import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import CTASection from '../../components/sections/CTASection';

export const revalidate = 1800;

export const metadata: Metadata = {
    title: 'Training Prices & Registration in Nigeria',
    description:
        'How PECB and professional training pricing works at Ykay Consulting Hub — individual, corporate and bundle options, what drives cost, and how to request a quote.',
    alternates: { canonical: '/training-pricing' },
};

export default function TrainingPricingPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="PRICING & REGISTRATION"
                title="Training Prices & Registration in Nigeria"
                description="Straight answers on how our pricing works — and a fast, no-obligation quote for your exact situation."
            />

            <section className="pp-intro">
                <div className="wrap">
                    <p className="pp-lede">
                        Course pricing depends on the certification family, the level (Foundation, Lead Implementer,
                        Lead Auditor), the delivery format, and whether you are registering as an individual or as a
                        team. Rather than publish a stale list, we quote directly — most quotes come back the same
                        working day.
                    </p>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap">
                    <span className="kicker">THREE WAYS TO REGISTER</span>
                    <h2>Individuals, teams and bundles</h2>
                    <div className="pp-fam-grid">
                        <article className="pp-fam pp-fam-feature">
                            <h3>Individual registration</h3>
                            <p>
                                Join a scheduled course as yourself. Open the course page for the certification you
                                want and enrol directly, or contact us for guidance on the right level.
                            </p>
                            <div className="pp-levels">
                                <Link href="/training" className="pp-level">
                                    Browse courses
                                </Link>
                                <Link href="/contact" className="pp-level">
                                    Ask a question
                                </Link>
                            </div>
                        </article>
                        <article className="pp-fam pp-fam-feature">
                            <h3>Corporate cohorts</h3>
                            <p>
                                Train a team in-house or in a private virtual cohort, scheduled around your
                                calendar. Corporate pricing scales with group size and delivery format.
                            </p>
                            <div className="pp-levels">
                                <Link href="/corporate-training" className="pp-level">
                                    Request a quote
                                </Link>
                            </div>
                        </article>
                        <article className="pp-fam pp-fam-feature">
                            <h3>Certification bundles</h3>
                            <p>
                                Combining certifications — for example an implementer and an auditor track — is
                                usually cheaper together. See current bundles for ready-made paths.
                            </p>
                            <div className="pp-levels">
                                <Link href="/bundles" className="pp-level">
                                    View bundles
                                </Link>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap pp-how">
                    <span className="kicker">WHAT DRIVES COST</span>
                    <h2>Five factors behind the price of a course</h2>
                    <ol className="pp-steps">
                        <li>
                            <strong>Level.</strong> Foundation courses are shorter; Lead Implementer and Lead
                            Auditor courses carry more days and a larger exam.
                        </li>
                        <li>
                            <strong>Delivery format.</strong> Self-paced, virtual instructor-led and in-person
                            delivery each carry different costs.
                        </li>
                        <li>
                            <strong>Group size.</strong> Corporate cohorts are priced per engagement and scale
                            favourably with team size.
                        </li>
                        <li>
                            <strong>Materials and exam.</strong> Official courseware and the certification exam are
                            part of the package — no surprise line items later.
                        </li>
                        <li>
                            <strong>Scheduling.</strong> Custom dates and in-house delivery are arranged to fit
                            your calendar.
                        </li>
                    </ol>
                </div>
            </section>

            <CTASection heading="Get your quote today" />
        </SiteLayout>
    );
}
