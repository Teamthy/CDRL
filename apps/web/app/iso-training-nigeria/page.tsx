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
    title: 'ISO Training in Nigeria — 40+ ISO Certification Courses',
    description:
        'ISO certification training in Nigeria under our PECB partnership: ISO/IEC 27001, ISO/IEC 42001, ISO 9001, ISO 22301 and dozens more standards, Foundation to Lead Auditor, virtual, self-paced and in-house.',
    alternates: { canonical: '/iso-training-nigeria' },
};

function famLabel(c: Course) {
    return c.subtitle.replace(' (PECB Certified)', '');
}

export default async function IsoTrainingNigeriaPage() {
    const courses = await getCourses();
    const iso = courses.filter(
        (c) => c.subtitle.includes('PECB') && /^ISO/i.test(c.title.trim()),
    );

    const groups = new Map<string, Course[]>();
    for (const c of iso) {
        const list = groups.get(c.title) ?? [];
        list.push(c);
        groups.set(c.title, list);
    }
    const families = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <SiteLayout>
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    name: 'ISO training courses in Nigeria',
                    numberOfItems: iso.length,
                    itemListElement: families.slice(0, 40).map(([title], i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        name: title,
                    })),
                }}
            />
            <PageHero
                eyebrow="ISO CERTIFICATION TRAINING"
                title="ISO Training in Nigeria"
                description="40+ ISO management-system standards delivered under our PECB partnership — from information security and AI to quality, continuity and beyond."
            />

            <section className="pp-intro">
                <div className="wrap">
                    <p className="pp-lede">
                        ISO standards are how organisations prove they run security, quality, continuity and
                        governance seriously — and ISO training is how professionals earn the credentials to build
                        and audit those systems. As an{' '}
                        <Link href="/pecb-training-nigeria" className="text-link">
                            Authorized Partner of PECB
                        </Link>
                        , Ykay Consulting Hub delivers official ISO certification courses across Nigeria: most
                        standards offer Foundation, Lead Implementer and Lead Auditor levels, delivered virtual,
                        self-paced or in-house.
                    </p>
                    <p className="pp-count-note" aria-live="polite">
                        <strong>{families.length}</strong> ISO standards · <strong>{iso.length}</strong> courses
                        available
                    </p>
                </div>
            </section>

            <section className="pp-section">
                <div className="wrap">
                    <span className="kicker">THE CATALOGUE</span>
                    <h2>Every ISO standard we train</h2>
                    <div className="pp-fam-grid">
                        {families.map(([title, list]) => (
                            <article key={title} className="pp-fam">
                                <h3>{title}</h3>
                                <div className="pp-levels">
                                    {list.map((c) => (
                                        <Link key={c.id} href={`/training/${c.slug}` as Route} className="pp-level">
                                            {famLabel(c)}
                                        </Link>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection heading="Not sure which standard you need?" />
        </SiteLayout>
    );
}
