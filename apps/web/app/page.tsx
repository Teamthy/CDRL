import type { Metadata } from 'next';
import HomePage from '../components/HomePage';
import SiteLayout from '../components/SiteLayout';
import { getCourseCards } from '../lib/data';

export const revalidate = 1800;

export const metadata: Metadata = {
    title: 'PECB, Cybersecurity & AI Governance Training in Nigeria',
    description:
        'Official PECB Authorized Partner in Lagos, Nigeria. ISO 27001, ISO 42001, cybersecurity, GRC, AI governance and executive leadership certification training from Ykay Consulting Hub.',
    alternates: { canonical: '/' },
};

export default async function Page() {
    const courses = await getCourseCards();
    return (
        <SiteLayout>
            <HomePage courses={courses} />
        </SiteLayout>
    );
}