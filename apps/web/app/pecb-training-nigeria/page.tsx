import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import CTASection from '../../components/sections/CTASection';
import JsonLd from '../../components/JsonLd';
import { getCourses } from '../../lib/data';
import type { Course } from '../../lib/contracts';

export const revalidate = 1800;

export const metadata: Metadata = {
    title: 'PECB Training in Nigeria',
    description:
        'Official PECB certification training in Nigeria from an Authorized Partner — ISO/IEC 27001, ISO/IEC 42001, ISO 9001, ISO 22301, GDPR, DORA and 40+ certification families. Virtual, self-paced and in-house delivery.',
    alternates: { canonical: '/pecb-training-nigeria' },
};

const OFFICIAL_RELEASE =
    'https://pecb.com/en/newsReleases/pecb-signs-a-partnership-agreement-with-ykay-consulting-hub';

const FLAGSHIPS: { match: string; blurb: string }[] = [
    { match: '27001', blurb: 'Information security management (ISMS) — Foundation, Lead Implementer and Lead Auditor tracks.' },
    { match: '42001', blurb: 'AI management systems — implement and govern AI responsibly under ISO/IEC 42001.' },
    { match: '9001', blurb: 'Quality management systems for organisations of every size and sector.' },
    { match: '22301', blurb: 'Business continuity management — build resilient, auditable continuity programmes.' },
    { match: 'GDPR', blurb: 'Data protection, including the Certified Data Protection Officer (CDPO) track.' },
    { match: 'DORA', blurb: 'Digital operational resilience for the financial sector, Foundation to Lead Manager.' },
    { match: 'Cybersecurity', blurb: 'Cybersecurity management — from Foundation to Lead Cybersecurity Manager.' },
    { match: 'AI', blurb: 'AI Manager, AI Risk Management and AI Security professional certifications.' },
];

const FAQS: { q: string; a: string }[] = [
    {
        q: 'Who is PECB?',
        a: 'PECB is an ISO certification and training company. It develops and administers certification programmes and examinations across information security, cybersecurity, AI management, privacy, business continuity, governance and many other ISO management-system disciplines. Certification courses delivered under the partnership conclude with the official PECB certification exam.',
    },
    {
        q: 'Is Ykay Consulting Hub an official PECB partner?',
        a: 'Yes. PECB announced its partnership agreement with Ykay Consulting Hub on 06 August 2026. The announcement is published on PECB’s official website, and you can read it via the link in the partnership section below.',
    },
    {
        q: 'Which PECB courses are available in Nigeria through Ykay Consulting Hub?',
        a: 'The portfolio spans 40+ certification families — ISO/IEC 27001, ISO/IEC 42001, ISO 9001, ISO 22301, ISO 31000, ISO 37301, GDPR, DORA, cybersecurity management and the AI certification tracks, most with Foundation, Lead Implementer and Lead Auditor levels. Browse the full catalogue on this page or on the partnerships page.',
    },
    {
        q: 'Are PECB courses delivered online or in person?',
        a: 'Delivery varies by course: virtual instructor-led sessions, self-paced e-learning, and in-person or in-house delivery for teams. Each course page lists its delivery mode, and corporate cohorts can be scheduled to suit your organisation.',
    },
    {
        q: 'How do I register for PECB training in Nigeria?',
        a: 'Open the course page for the certification you want and enrol directly, or contact us for guidance on the right level for your experience. For teams and organisations, request a corporate training quote and we will schedule a cohort around your calendar.',
    },
];

function famLabel(c: Course) {
    return c.subtitle.replace(' (PECB Certified)', '');
}

export default async function PecbTrainingNigeriaPage() {
    const courses = await getCourses();
    const pecb = courses.filter((c) => c.subtitle.includes('PECB'));

    const groups = new Map<string, Course[]>();
    for (const c of pecb) {
        const list = groups.get(c.title) ?? [];
        list.push(c);
        groups.set(c.title, list);
    }

    const used = new Set<string>();
    const flagships = FLAGSHIPS.flatMap((f) => {
        for (const [title, list] of groups) {
            if (!used.has(title) && title.toUpperCase().includes(f.match)) {
                used.add(title);
                return [{ title, blurb: f.blurb, courses: list }];
            }
        }
        return [];
    });
    const rest = [...groups.entries()]
        .filter(([title]) => !used.has(title))
        .map(([title, list]) => ({ title, blurb: '', courses: list }))
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <SiteLayout>
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: FAQS.map((f) => ({
                        '@type': 'Question',
                        name: f.q,
                        acceptedAnswer: { '@type': 'Answer', text: f.a },
                    })),
                }}
            />
            <PageHero
                eyebrow="PECB AUTHORIZED PARTNER"
                title="PECB Training in Nigeria"
                description="Official PECB certification courses — delivered in Nigeria by Ykay Consulting Hub, an Authorized Partner of PECB."
            />

            <section className="pp-intro">
                <div className="wrap">
                    <p className="pp-lede">
                        Ykay Consulting Hub delivers the PECB certification portfolio across Nigeria: information
                        security, cybersecurity, AI management, business continuity, privacy and the wider family of
                        ISO management-system standards. PECB announced the partnership on{' '}
                        <strong>06 August 2026</strong> — you can{' '}
                        <a href={OFFICIAL_RELEASE} target="_blank" rel="noopener noreferrer">
                            read the official release on pecb.com
                        </a>
                        , our{' '}
                        <Link href="/pecb-signs-partnership-agreement-with-ykay-consulting-hub" className="text-link">
                            announcement page
                        </Link>
                        , or{' '}
                        <Link href="/partnerships" className="text-link">
                            browse the illustrated portfolio
                        </Link>
                        .
                    </p>
                    <p className="pp-count-note" aria-live="polite">
                        <strong>{groups.size}</strong> certification families · <strong>{pecb.length}</strong> PECB
                        courses available
                    </p>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap">
                    <span className="kicker">START HERE</span>
                    <h2>Flagship PECB certifications</h2>
                    <div className="pp-fam-grid">
                        {flagships.map((f) => (
                            <article key={f.title} className="pp-fam pp-fam-feature">
                                <h3>{f.title}</h3>
                                <p>{f.blurb}</p>
                                <div className="pp-levels">
                                    {f.courses.map((c) => (
                                        <Link
                                            key={c.id}
                                            href={`/training/${c.slug}` as Route}
                                            className="pp-level"
                                        >
                                            {famLabel(c)}
                                        </Link>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {rest.length > 0 && (
                <section className="pp-section">
                    <div className="wrap">
                        <span className="kicker">FULL CATALOGUE</span>
                        <h2>Every PECB certification family</h2>
                        <div className="pp-fam-grid">
                            {rest.map((f) => (
                                <article key={f.title} className="pp-fam">
                                    <h3>{f.title}</h3>
                                    <div className="pp-levels">
                                        {f.courses.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/training/${c.slug}` as Route}
                                                className="pp-level"
                                            >
                                                {famLabel(c)}
                                            </Link>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="pp-section">
                <div className="wrap pp-how">
                    <span className="kicker">HOW IT WORKS</span>
                    <h2>From registration to certification</h2>
                    <ol className="pp-steps">
                        <li>
                            <strong>Pick your level.</strong> Foundation courses suit newcomers; Lead Implementer and
                            Lead Auditor tracks suit practitioners building or auditing management systems. Not sure?{' '}
                            <Link href="/contact" className="text-link">
                                Ask us
                            </Link>{' '}
                            — we will point you to the right starting level.
                        </li>
                        <li>
                            <strong>Enrol.</strong> Register directly on the course page, or{' '}
                            <Link href="/corporate-training" className="text-link">
                                request a corporate quote
                            </Link>{' '}
                            to train a team in-house.
                        </li>
                        <li>
                            <strong>Train.</strong> Complete the course in the delivery mode listed on the course page —
                            virtual, self-paced, or in-person.
                        </li>
                        <li>
                            <strong>Get certified.</strong> PECB certification courses conclude with the official PECB
                            certification exam, and your credential is issued by PECB.
                        </li>
                    </ol>
                </div>
            </section>

            <section className="pp-section pp-faq">
                <div className="wrap">
                    <span className="kicker">FAQ</span>
                    <h2>PECB training in Nigeria — common questions</h2>
                    {FAQS.map((f) => (
                        <div key={f.q} className="pp-faq-item">
                            <h3>{f.q}</h3>
                            <p>{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <CTASection heading="Ready to start your PECB certification?" />
        </SiteLayout>
    );
}
