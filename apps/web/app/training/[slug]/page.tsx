import { notFound } from 'next/navigation';
import SiteLayout from '../../../components/SiteLayout';
import CourseDetailHero from '../../../components/course/CourseDetailHero';
import CourseBody from '../../../components/course/CourseBody';
import FamilyLadder from '../../../components/course/FamilyLadder';
import RelatedCourses from '../../../components/course/RelatedCourses';
import CourseActionPanel from '../../../components/course/CourseActionPanel';
import CareerOutcomes from '../../../components/course/CareerOutcomes';
import WaitlistCTA from '../../../components/course/WaitlistCTA';
import { getCourseBySlug, getCourses } from '../../../lib/data';
import { courses as localCourses } from '../../../lib/content';


export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

// Pre-render the known catalog from local fallback content; any additional
// API-sourced slugs render on-demand (dynamicParams default) and are cached.
export async function generateStaticParams() {
    return localCourses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);
    if (!course) return { title: 'Course not found' };
    return {
        title: `${course.title} ${course.subtitle}`,
        description: course.overview,
        alternates: { canonical: `/training/${course.slug}` },
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);
    if (!course) notFound();
    const courses = await getCourses();

    return (
        <SiteLayout>
            <CourseDetailHero course={course} />
            <FamilyLadder courses={courses} currentSlug={slug} />
            <CourseBody course={course} />
            <CourseActionPanel course={course} />
            <CareerOutcomes course={course} />
            <div id="related">
                <RelatedCourses courses={courses} currentSlug={slug} />
            </div>
            <div className="wrap waitlist-strip">
                <WaitlistCTA course={course} />
            </div>
        </SiteLayout>
    );
}
