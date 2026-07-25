import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import LegalContent from '../../components/sections/LegalContent';
import CTASection from '../../components/sections/CTASection';

export const metadata = {
    title: 'Privacy Policy',
    description: 'How CDRL collects, uses, and protects personal data across our learning and advisory services.',
};

const sections = [
    {
        title: 'Overview',
        body: (
            <p>
                CDRL is committed to protecting the privacy of learners, corporate clients, and visitors. This
                policy explains what data we collect, how we use it, and the choices you have regarding your
                information.
            </p>
        ),
    },
    {
        title: 'Information we collect',
        body: (
            <p>
                We collect information you provide when you enquire about a program, register for a course, or
                submit a contact form. We also collect limited technical information (such as browser type and
                pages visited) to improve our services.
            </p>
        ),
    },
    {
        title: 'How we use your information',
        body: (
            <p>
                Your information is used to respond to enquiries, deliver programs and communications you have
                requested, improve our platform, and meet our legal and regulatory obligations.
            </p>
        ),
    },
    {
        title: 'Sharing and disclosure',
        body: (
            <p>
                We do not sell personal data. We share information only with service providers that support the
                operation of our platform under appropriate confidentiality arrangements, or where required by
                law.
            </p>
        ),
    },
    {
        title: 'Your rights',
        body: (
            <p>
                You may request access to, correction of, or deletion of your personal data by contacting
                training@cdrl.africa. We aim to respond within a reasonable time in line with applicable law.
            </p>
        ),
    },
];

export default function PrivacyPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="PRIVACY"
                title="How CDRL handles your data."
                description="A plain-language summary of our privacy practices for learners, organizations, and site visitors."
            />
            <LegalContent sections={sections} lastUpdated="July 2026" />
            <CTASection heading="Questions about your data?" ctaLabel="Contact CDRL" />
        </SiteLayout>
    );
}