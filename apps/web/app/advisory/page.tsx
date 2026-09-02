import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getContent } from '../../lib/api';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Advisory & Consulting',
    description:
        'Practical advisory and consulting services that translate frameworks and risk priorities into operational systems.',
};

export default async function AdvisoryPage() {
    let content = pageData.Advisory;
    try {
        const remote = await getContent('Advisory');
        if (remote) content = remote;
    } catch {
        /* fallback */
    }

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Explore an advisory engagement." />
        </SiteLayout>
    );
}