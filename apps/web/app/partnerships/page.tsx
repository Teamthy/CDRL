import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Partnerships',
    description: 'Institutional collaborations that build shared capability, standards, and responsible innovation across Africa.',
    alternates: { canonical: '/partnerships' },
};

export default async function PartnershipsPage() {
    const content = (await getPageContent('Partnerships')) ?? pageData['Partnerships'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Interested in partnering with CDRL?" />
        </SiteLayout>
    );
}
