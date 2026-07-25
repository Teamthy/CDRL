import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import LearningPlanSelected from '../../components/sections/LearningPlanSelected';
import { getCourses } from '../../lib/api';
import { courses as fallbackCourses, type Course } from '../../lib/content';

export const metadata = {
    title: 'Your Learning Plan',
    description: 'Review the programs you have selected and complete your enrollment enquiry.',
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

export default async function LearningPlanPage() {
    const courses = await loadCourses();
    return (
        <SiteLayout>
            <PageHero
                eyebrow="YOUR LEARNING PLAN"
                title="Programs you're considering."
                description="Review your selected professional development programs and confirm your enquiry."
            />
            <LearningPlanSelected courses={courses} />
        </SiteLayout>
    );
}