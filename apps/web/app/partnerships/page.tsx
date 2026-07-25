import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getContent } from '../../lib/api';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Partnerships',
    description:
        'Institutional collaborations that build shared capability, standards, and responsible innovation across Africa.',
};

export default async function PartnershipsPage() {
    let content = pageData.Partnerships;
    try {
        const remote = await getContent('Partnerships');
        if (remote) content = remote;
    } catch {
        /* fallback */
    }

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Interested in partnering with CDRL?" />
        </SiteLayout>
    );
}