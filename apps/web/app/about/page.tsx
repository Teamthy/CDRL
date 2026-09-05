import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import Link from 'next/link';
import CTASection from '../../components/sections/CTASection';
import { getPageContent } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'About CDRL',
    description: 'CDRL is a professional education, certification, and advisory institution focused on cybersecurity, digital governance, and leadership.',
    alternates: { canonical: '/about' },
};

export default async function AboutPage() {
    const content = (await getPageContent('About')) ?? pageData['About'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <EditorialRows blocks={content.blocks} />
            <section className="cross-band">
                <div className="wrap">
                    <p>
                        Ykay Consulting Hub is an Authorized Partner of PECB, delivering official ISO and
                        cybersecurity certification training across Nigeria —{' '}
                        <Link href="/pecb-training-nigeria" className="text-link">
                            explore PECB training in Nigeria
                        </Link>{' '}
                        or{' '}
                        <Link href="/iso-training-nigeria" className="text-link">
                            browse every ISO standard
                        </Link>
                        .
                    </p>
                </div>
            </section>
            <CTASection />
        </SiteLayout>
    );
}
