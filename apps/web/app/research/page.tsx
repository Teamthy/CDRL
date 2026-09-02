import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getContent } from '../../lib/api';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Research & Insights',
    description:
        'Analysis and practical commentary on cybersecurity, AI governance, and digital leadership for decision-makers across Africa.',
};

export default async function ResearchPage() {
    let content = pageData.Research;
    try {
        const remote = await getContent('Research');
        if (remote) content = remote;
    } catch {
        /* fallback */
    }

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Want to collaborate on research?" ctaLabel="Get in touch" />
        </SiteLayout>
    );
}