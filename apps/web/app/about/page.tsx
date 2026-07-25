import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getContent } from '../../lib/api';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'About CDRL',
    description:
        'CDRL is a professional education, certification, and advisory institution focused on cybersecurity, digital governance, and leadership.',
};

export default async function AboutPage() {
    let content = pageData.About;
    try {
        const remote = await getContent('About');
        if (remote) content = remote;
    } catch {
        /* fallback */
    }

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection />
        </SiteLayout>
    );
}