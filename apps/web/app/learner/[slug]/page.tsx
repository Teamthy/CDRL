import type { Metadata } from 'next';
import SiteLayout from '../../../components/SiteLayout';
import CoursePlayer from './CoursePlayer';

export const metadata: Metadata = {
    title: 'Course modules',
    robots: { index: false, follow: false },
};

export default async function LearnerCoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <SiteLayout>
            <section className="auth-section">
                <div className="wrap learner-wrap">
                    <CoursePlayer slug={slug} />
                </div>
            </section>
        </SiteLayout>
    );
}
