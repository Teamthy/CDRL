import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import CTASection from '../../components/sections/CTASection';
import JsonLd from '../../components/JsonLd';

export const revalidate = 1800;

export const metadata: Metadata = {
    title: 'PECB Certification in Nigeria — Process, Exams & Credentials',
    description:
        'How PECB certification works in Nigeria: choosing a level, training, the certification exam, credential issue and verification — delivered by Ykay Consulting Hub, an Authorized Partner of PECB.',
    alternates: { canonical: '/pecb-certification-nigeria' },
};

const FAQS = [
    {
        q: 'Is PECB certification recognized?',
        a: 'PECB credentials follow the ISO management-system standards they map to and are recognised by employers internationally, including in Nigeria. The credential is issued by PECB itself and is verifiable online.',
    },
    {
        q: 'Do I need Foundation before a Lead level?',
        a: 'There is no general requirement to hold Foundation before a Lead Implementer or Lead Auditor course. Newcomers to a standard usually benefit from starting at Foundation, while experienced practitioners often move directly to the level that matches their role.',
    },
    {
        q: 'What happens if I do not pass the exam?',
        a: 'Retake options follow the current PECB Examination Rules and Policies. The exact retake process and applicable conditions are confirmed in full at registration, and our team supports candidates through it.',
    },
    {
        q: 'How do I verify a PECB certificate?',
        a: 'PECB issues credentials directly and provides online verification. Because the credential comes from PECB — not the training partner — employers can verify it independently.',
    },
];

export default function PecbCertificationNigeriaPage() {
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
                eyebrow="PECB CERTIFICATION"
                title="PECB Certification in Nigeria"
                description="The journey from choosing a course to holding a verifiable PECB credential — and how it works when you train with an Authorized Partner."
            />

            <section className="pp-intro">
                <div className="wrap">
                    <p className="pp-lede">
                        PECB certification is earned by completing a certification course and passing the official
                        PECB certification exam. Ykay Consulting Hub delivers the training in Nigeria as an{' '}
                        <Link href="/pecb-training-nigeria" className="text-link">
                            Authorized Partner of PECB
                        </Link>
                        ; the exam and the credential that follows are administered and issued by PECB itself. This
                        page explains each stage of that journey plainly.
                    </p>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap pp-how">
                    <span className="kicker">THE JOURNEY</span>
                    <h2>From course choice to credential</h2>
                    <ol className="pp-steps">
                        <li>
                            <strong>Choose the right level.</strong> Foundation builds concepts and vocabulary. Lead
                            Implementer trains the people who build a management system. Lead Auditor trains the
                            people who verify one. Match the level to your role —{' '}
                            <Link href="/contact" className="text-link">
                                ask us
                            </Link>{' '}
                            if you are unsure.
                        </li>
                        <li>
                            <strong>Complete the training.</strong> Courses run virtual instructor-led, self-paced,
                            or in-person, and conclude with the certification exam. Browse the{' '}
                            <Link href="/pecb-training-nigeria" className="text-link">
                                full PECB portfolio
                            </Link>
                            .
                        </li>
                        <li>
                            <strong>Sit the certification exam.</strong> The exam is the official PECB exam for your
                            course. Format, duration and pass conditions follow the current PECB Examination Rules
                            and Policies and are confirmed at registration.
                        </li>
                        <li>
                            <strong>Receive and verify your credential.</strong> On passing, PECB issues your
                            credential, and it can be verified online — which is what makes it credible to employers
                            and clients.
                        </li>
                    </ol>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap">
                    <span className="kicker">EXAMS, MAINTAINED HONESTLY</span>
                    <h2>Exam rules and credential maintenance</h2>
                    <p className="pp-lede" style={{ fontSize: 15 }}>
                        We do not paraphrase the rules — we point you at the source. Exam format, retake policy,
                        credential maintenance and the PECB code of ethics are governed by the current PECB
                        Examination Rules and Policies, published on{' '}
                        <a href="https://pecb.com" target="_blank" rel="noopener noreferrer">
                            pecb.com
                        </a>
                        . Our admissions team confirms exactly what applies to your chosen course at registration,
                        so there are no surprises on exam day.
                    </p>
                </div>
            </section>

            <section className="pp-section pp-faq">
                <div className="wrap">
                    <span className="kicker">FAQ</span>
                    <h2>PECB certification — common questions</h2>
                    {FAQS.map((f) => (
                        <div key={f.q} className="pp-faq-item">
                            <h3>{f.q}</h3>
                            <p>{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <CTASection heading="Ready to earn your PECB credential?" />
        </SiteLayout>
    );
}
