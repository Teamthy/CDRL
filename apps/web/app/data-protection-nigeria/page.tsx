import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import CTASection from '../../components/sections/CTASection';

export const revalidate = 1800;

export const metadata: Metadata = {
    title: 'Data Protection & NDPA Training in Nigeria',
    description:
        'Data protection training for Nigerian organisations: GDPR, Certified Data Protection Officer (CDPO) and information security courses that map to the Nigeria Data Protection Act — from an Authorized PECB Partner.',
    alternates: { canonical: '/data-protection-nigeria' },
};

export default function DataProtectionNigeriaPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="DATA PROTECTION · NIGERIA"
                title="Data Protection & NDPA Training in Nigeria"
                description="Build the capability Nigeria's data protection expectations demand — privacy, security and DPO-level training delivered locally."
            />

            <section className="pp-intro">
                <div className="wrap">
                    <p className="pp-lede">
                        Nigeria now has a dedicated data protection law — the Nigeria Data Protection Act — with real
                        obligations for organisations that handle personal data, and a regulator with power to act.
                        Whether you serve customers, employ staff, or process data for clients, someone in your
                        organisation needs to understand what the law expects and how to run compliant processing.
                        That is a training problem, and it is ours to solve.
                    </p>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap pp-how">
                    <span className="kicker">WHAT THE LAW EXPECTS</span>
                    <h2>The obligations, in plain language</h2>
                    <ol className="pp-steps">
                        <li>
                            <strong>Lawful, fair processing.</strong> Personal data needs a lawful basis, and data
                            subjects need to know what happens to their data.
                        </li>
                        <li>
                            <strong>Data subject rights.</strong> People can ask about, access, correct and in
                            defined cases delete their data — and organisations must be able to answer.
                        </li>
                        <li>
                            <strong>Security and breach handling.</strong> Appropriate protection of personal data,
                            and a real process for when things go wrong.
                        </li>
                        <li>
                            <strong>Accountability and oversight.</strong> Records, impact thinking where processing
                            is high-risk, and designated responsibility — which is where DPO-level competence
                            matters.
                        </li>
                    </ol>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap">
                    <span className="kicker">THE TRAINING PATH</span>
                    <h2>Courses that map to the job</h2>
                    <div className="pp-fam-grid">
                        <article className="pp-fam pp-fam-feature">
                            <h3>GDPR Foundation</h3>
                            <p>
                                The global benchmark regulation behind modern privacy laws — concepts, obligations,
                                rights and vocabulary. The natural starting point for any privacy role.
                            </p>
                            <div className="pp-levels">
                                <Link href="/training/gdpr-foundation" className="pp-level">
                                    View course
                                </Link>
                            </div>
                        </article>
                        <article className="pp-fam pp-fam-feature">
                            <h3>Certified Data Protection Officer (CDPO)</h3>
                            <p>
                                The PECB DPO programme: carrying formal responsibility for compliance, running
                                impact assessments, handling rights requests, breach response and regulator
                                contact.
                            </p>
                            <div className="pp-levels">
                                <Link href="/training/gdpr-data-protection-officer-cdpo" className="pp-level">
                                    View course
                                </Link>
                            </div>
                        </article>
                        <article className="pp-fam pp-fam-feature">
                            <h3>Information security baseline</h3>
                            <p>
                                Privacy lives on top of security. ISO/IEC 27001 training gives the people around
                                your privacy programme the security foundation personal data depends on.
                            </p>
                            <div className="pp-levels">
                                <Link href="/training/iso-iec-27001-foundation" className="pp-level">
                                    ISO/IEC 27001 Foundation
                                </Link>
                            </div>
                        </article>
                    </div>
                    <p className="pp-count-note">
                        These are the core paths — the{' '}
                        <Link href="/pecb-training-nigeria" className="text-link">
                            full PECB portfolio
                        </Link>{' '}
                        includes privacy-adjacent and security specialisations for teams that need them.
                    </p>
                </div>
            </section>

            <section className="pp-section pp-faq">
                <div className="wrap">
                    <span className="kicker">FAQ</span>
                    <h2>Data protection training — common questions</h2>
                    <div className="pp-faq-item">
                        <h3>Does GDPR training cover the Nigeria Data Protection Act?</h3>
                        <p>
                            GDPR is the reference framework most privacy laws — including the NDPA — draw on, so GDPR
                            training builds transferable competence. Our team adds Nigerian context in delivery,
                            and we keep course content aligned to the PECB official curriculum.
                        </p>
                    </div>
                    <div className="pp-faq-item">
                        <h3>Who should take DPO training?</h3>
                        <p>
                            Anyone carrying formal data protection responsibility — current or aspiring DPOs, legal
                            and compliance leads, and the governance staff who support them. Organisations deciding
                            whether they need a DPO should contact us for guidance first.
                        </p>
                    </div>
                </div>
            </section>

            <CTASection heading="Build your data protection capability" />
        </SiteLayout>
    );
}
