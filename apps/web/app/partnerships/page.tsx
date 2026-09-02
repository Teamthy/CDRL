import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import Link from 'next/link';
import type { Route } from 'next';
import { GraduationCap } from 'lucide-react';
import { getCourses, getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Partnerships',
    description: 'Institutional collaborations that build shared capability, standards, and responsible innovation across Africa.',
    alternates: { canonical: '/partnerships' },
};

export default async function PartnershipsPage() {
    const content = (await getPageContent('Partnerships')) ?? pageData['Partnerships'];
    const courses = await getCourses();
    const pecbCourses = courses.filter((c) => c.subtitle.includes('PECB'));

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            {pecbCourses.length > 0 && (
                <section className="pecb-portfolio">
                    <div className="wrap">
                        <span className="kicker">PECB CERTIFIED PORTFOLIO</span>
                        <h2>Programmes delivered under our PECB partnership</h2>
                        <p className="pecb-credit">
                            Official PECB certification courses, delivered by Ykay Consulting Hub and concluded with the
                            PECB certification exam. Exact scope and titles follow the{' '}
                            <a href="https://pecb.com/en/education-and-certification" target="_blank" rel="noopener noreferrer">
                                PECB catalogue
                            </a>
                            .
                        </p>
                        <div className="pecb-portfolio-grid">
                            {pecbCourses.map((c) => (
                                <Link key={c.id} href={`/training/${c.slug}` as Route} className="pecb-course-card">
                                    <GraduationCap aria-hidden="true" />
                                    <span className="pecb-course-title">{c.title}</span>
                                    <span className="pecb-course-sub">{c.subtitle}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Interested in partnering with CDRL?" />
        </SiteLayout>
    );
}
