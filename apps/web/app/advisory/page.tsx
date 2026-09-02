import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Advisory & Consulting',
    description: 'Practical advisory and consulting services that translate frameworks and risk priorities into operational systems.',
    alternates: { canonical: '/advisory' },
};

export default async function AdvisoryPage() {
    const content = (await getPageContent('Advisory')) ?? pageData['Advisory'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Explore an advisory engagement." />
        </SiteLayout>
    );
}
