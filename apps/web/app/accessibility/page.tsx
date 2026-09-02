import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import LegalContent from '../../components/sections/LegalContent';
import CTASection from '../../components/sections/CTASection';

export const metadata = {
    title: 'Accessibility',
    description: 'Our commitment to accessible, inclusive learning experiences at CDRL.',

    alternates: { canonical: '/accessibility' },
};

const sections = [
    {
        title: 'Our commitment',
        body: (
            <p>
                CDRL is committed to providing digital experiences that are accessible to a wide range of
                learners, including people who rely on assistive technologies. We aim to conform to WCAG 2.2
                Level AA across the platform.
            </p>
        ),
    },
    {
        title: 'What we do',
        body: (
            <p>
                We design with strong colour contrast, keyboard-accessible interactions, semantic HTML,
                descriptive alternative text for meaningful imagery, and clear focus indicators. We test the
                site with keyboard navigation and reduced-motion preferences.
            </p>
        ),
    },
    {
        title: 'Ongoing improvement',
        body: (
            <p>
                Accessibility is a continuing effort. We welcome feedback that helps us improve. If you
                experience a barrier using the CDRL platform, please contact us.
            </p>
        ),
    },
    {
        title: 'Contact',
        body: (
            <p>
                For accessibility feedback or to request content in an alternative format, email
                training@cdrl.africa and we will respond as promptly as we can.
            </p>
        ),
    },
];

export default function AccessibilityPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="ACCESSIBILITY"
                title="Learning that works for more people."
                description="How we design, test, and continue to improve accessibility across the CDRL platform."
            />
            <LegalContent sections={sections} lastUpdated="July 2026" />
            <CTASection heading="Have an accessibility question?" ctaLabel="Contact us" />
        </SiteLayout>
    );
}