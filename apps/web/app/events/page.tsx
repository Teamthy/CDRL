import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Events & Masterclasses',
    description: 'Upcoming certification programs, executive briefings, and practitioner masterclasses.',
    alternates: { canonical: '/events' },
};

export default async function EventsPage() {
    const content = (await getPageContent('Events')) ?? pageData['Events'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Register for an upcoming program." ctaLabel="Enquire about a program" />
        </SiteLayout>
    );
}
