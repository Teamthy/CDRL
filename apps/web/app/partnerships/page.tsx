import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import PecbPortfolioShowcase from '../../components/sections/PecbPortfolioShowcase';
import Link from 'next/link';
import type { Route } from 'next';
import { getCourses, getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'PECB Partnership & Courses in Nigeria',
    description: 'Ykay Consulting Hub is an Authorized Partner of PECB, delivering official PECB certification courses across Nigeria. Explore the partnership and the full PECB portfolio.',
    alternates: { canonical: '/partnerships' },
};

export default async function PartnershipsPage() {
    const content = (await getPageContent('Partnerships')) ?? pageData['Partnerships'];
    const courses = await getCourses();
    const pecbCourses = courses.filter((c) => c.subtitle.includes('PECB'));

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <PecbPortfolioShowcase courses={pecbCourses} />
            <EditorialRows blocks={content.blocks} />
        </SiteLayout>
    );
}
