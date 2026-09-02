import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import CourseMarketplace from '../../components/sections/CourseMarketplace';
import { getCourses } from '../../lib/api';
import { courses as fallbackCourses, type Course } from '../../lib/content';

export const revalidate = 300;

export const metadata = {
    title: 'Training & Certification',
    description:
        'Discover flexible, practitioner-led programs in cybersecurity, GRC, AI governance, and executive leadership.',
};

async function loadCourses(): Promise<Course[]> {
    try {
        const result = await getCourses();
        if (Array.isArray(result) && result.length > 0) return result as Course[];
    } catch {
        /* silent */
    }
    return fallbackCourses;
}

export default async function TrainingPage() {
    const courses = await loadCourses();
    return (
        <SiteLayout>
            <PageHero
                eyebrow="TRAINING & CERTIFICATION"
                title="Credentials that build confidence."
                description="Discover flexible, practitioner-led programs designed to advance careers and strengthen organizations."
            />
            <CourseMarketplace courses={courses} />
        </SiteLayout>
    );
}