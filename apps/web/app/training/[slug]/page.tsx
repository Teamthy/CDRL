import { notFound } from 'next/navigation';
import SiteLayout from '../../../components/SiteLayout';
import CourseDetailHero from '../../../components/course/CourseDetailHero';
import CourseBody from '../../../components/course/CourseBody';
import { getCourseBySlug } from '../../../lib/data';
import { courses as localCourses } from '../../../lib/content';

export const revalidate = 1800;

type Props = { params: { slug: string } };

// Pre-render the known catalog from local fallback content; any additional
// API-sourced slugs render on-demand (dynamicParams default) and are cached.
export async function generateStaticParams() {
    return localCourses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
    const course = await getCourseBySlug(params.slug);
    if (!course) return { title: 'Course not found' };
    return {
        title: `${course.title} ${course.subtitle}`,
        description: course.overview,
        alternates: { canonical: `/training/${course.slug}` },
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const course = await getCourseBySlug(params.slug);
    if (!course) notFound();

    return (
        <SiteLayout>
            <CourseDetailHero course={course} />
            <CourseBody course={course} />
        </SiteLayout>
    );
}
