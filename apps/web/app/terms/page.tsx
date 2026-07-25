import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import LegalContent from '../../components/sections/LegalContent';
import CTASection from '../../components/sections/CTASection';

export const metadata = {
    title: 'Terms of Use',
    description: 'The terms that govern your use of the CDRL platform, learning content, and services.',

    alternates: { canonical: '/terms' },
};

const sections = [
    {
        title: 'Acceptance of terms',
        body: (
            <p>
                By using the CDRL platform you agree to these terms. If you do not agree, please discontinue
                use of the site and services.
            </p>
        ),
    },
    {
        title: 'Use of the platform',
        body: (
            <p>
                You agree to use the platform for lawful professional purposes. You may not misuse, copy, or
                redistribute CDRL learning content without permission.
            </p>
        ),
    },
    {
        title: 'Intellectual property',
        body: (
            <p>
                All CDRL content, materials, and course frameworks are protected by copyright and other
                intellectual property rights owned by CDRL or its licensors.
            </p>
        ),
    },
    {
        title: 'Payments and refunds',
        body: (
            <p>
                Program fees, cancellation, and refund terms are specified during enrollment. Corporate
                engagements are governed by the signed service agreement.
            </p>
        ),
    },
    {
        title: 'Changes to these terms',
        body: (
            <p>
                CDRL may update these terms from time to time. Continued use of the platform after changes
                indicates acceptance of the updated terms.
            </p>
        ),
    },
];

export default function TermsPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="TERMS OF USE"
                title="The terms that guide our platform."
                description="A summary of the rules and expectations for using CDRL learning and advisory services."
            />
            <LegalContent sections={sections} lastUpdated="July 2026" />
            <CTASection heading="Have a legal or compliance question?" ctaLabel="Get in touch" />
        </SiteLayout>
    );
}