import Link from 'next/link';
import SiteLayout from '../../components/SiteLayout';
import { getCourses } from '../../lib/data';
import PageHero from '../../components/sections/PageHero';
import CourseMarketplace from '../../components/sections/CourseMarketplace';

export const revalidate = 300;

export const metadata = {
    title: 'Training & Certification Courses in Nigeria',
    description:
        'PECB and professional certification courses in Nigeria — ISO/IEC 27001, ISO/IEC 42001, ISO 9001, ISO 22301, cybersecurity, GRC, AI governance and executive leadership. Virtual, self-paced and in-person.',

    alternates: { canonical: '/training' },
};

export default async function TrainingPage() {
    const courses = await getCourses();
    return (
        <SiteLayout>
            <PageHero
                eyebrow="TRAINING & CERTIFICATION"
                title="Credentials that build confidence."
                description="Discover flexible, practitioner-led programs designed to advance careers and strengthen organizations."
            />
            <div className="wrap subnav">
                <span>Browse:</span>
                <Link href="/pecb-training-nigeria" className="text-link">PECB training</Link>
                <Link href="/iso-training-nigeria" className="text-link">ISO standards</Link>
                <Link href="/data-protection-nigeria" className="text-link">Data protection &amp; NDPA</Link>
                <Link href="/training-pricing" className="text-link">Prices &amp; registration</Link>
            </div>
            <CourseMarketplace courses={courses} />
        </SiteLayout>
    );
}