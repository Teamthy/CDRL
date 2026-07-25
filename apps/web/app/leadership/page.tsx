import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import LeadershipDetail from '../../components/sections/LeadershipDetail';
import CTASection from '../../components/sections/CTASection';

export const metadata = {
    title: 'Leadership',
    description:
        'Meet the practitioner behind CDRL — Adeyinka Oladimeji MSc, Founder and Lead Trainer.',

    alternates: { canonical: '/leadership' },
};

export default function LeadershipPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="LEADERSHIP"
                title="Experience that turns knowledge into action."
                description="Meet the practitioner behind CDRL's mission."
            />
            <LeadershipDetail />
            <CTASection heading="Bring this expertise into your organization." />
        </SiteLayout>
    );
}