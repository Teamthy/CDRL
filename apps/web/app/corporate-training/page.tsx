import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Corporate Training',
    description: 'Tailored corporate learning experiences for teams, executives, and boards across cybersecurity, GRC, and AI governance.',
    alternates: { canonical: '/corporate-training' },
};

export default async function CorporateTrainingPage() {
    const content = (await getPageContent('Corporate Training')) ?? pageData['Corporate Training'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Bring CDRL to your organization." ctaLabel="Request a proposal" />
        </SiteLayout>
    );
}
