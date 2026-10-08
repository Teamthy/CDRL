import SiteLayout from '../../components/SiteLayout';
import { getCourseCards } from '../../lib/data';
import PageHero from '../../components/sections/PageHero';
import LearningPlanSelected from '../../components/sections/LearningPlanSelected';

export const metadata = {
    title: 'Your Learning Plan',
    description: 'Review the programs you have selected and complete your enrollment enquiry.',

    alternates: { canonical: '/learning-plan' },
};

export default async function LearningPlanPage() {
    const courses = await getCourseCards();
    // LearningPlanSelected renders its own "Complete Enquiry" contact CTA.
    return (
        <SiteLayout footerCta={false}>
            <PageHero
                eyebrow="YOUR LEARNING PLAN"
                title="Programs you're considering."
                description="Review your selected professional development programs and confirm your enquiry."
            />
            <LearningPlanSelected courses={courses} />
        </SiteLayout>
    );
}