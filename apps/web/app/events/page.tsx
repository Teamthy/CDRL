import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import { getContent } from '../../lib/api';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Events & Masterclasses',
    description: 'Upcoming certification programs, executive briefings, and practitioner masterclasses.',
};

export default async function EventsPage() {
    let content = pageData.Events;
    try {
        const remote = await getContent('Events');
        if (remote) content = remote;
    } catch {
        /* fallback */
    }

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Register for an upcoming program." ctaLabel="Enquire about a program" />
        </SiteLayout>
    );
}