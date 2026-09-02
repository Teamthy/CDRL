import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Research & Insights',
    description: 'Analysis and practical commentary on cybersecurity, AI governance, and digital leadership for decision-makers across Africa.',
    alternates: { canonical: '/research' },
};

export default async function ResearchPage() {
    const content = (await getPageContent('Research')) ?? pageData['Research'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Want to collaborate on research?" ctaLabel="Get in touch" />
        </SiteLayout>
    );
}
