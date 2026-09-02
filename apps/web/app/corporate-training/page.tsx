import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getContent } from '../../lib/api';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Corporate Training',
    description:
        'Tailored corporate learning experiences for teams, executives, and boards across cybersecurity, GRC, and AI governance.',
};

export default async function CorporateTrainingPage() {
    let content = pageData['Corporate Training'];
    try {
        const remote = await getContent('Corporate Training');
        if (remote) content = remote;
    } catch {
        /* fallback */
    }

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Bring CDRL to your organization." ctaLabel="Request a proposal" />
        </SiteLayout>
    );
}