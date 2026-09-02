import { notFound } from 'next/navigation';
import SiteLayout from '../../../components/SiteLayout';
import CourseDetailHero from '../../../components/course/CourseDetailHero';
import CourseBody from '../../../components/course/CourseBody';
import { getCourse } from '../../../lib/api';
import { courses as fallbackCourses, type Course } from '../../../lib/content';

export const revalidate = 1800;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
    return fallbackCourses.map((c) => ({ slug: c.slug }));
}

async function loadCourse(slug: string): Promise<Course | null> {
    try {
        const result = await getCourse(slug);
        if (result) return result as Course;
    } catch {
        /* silent */
    }
    return fallbackCourses.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props) {
    const course = await loadCourse(params.slug);
    if (!course) return { title: 'Course not found' };
    return {
        title: `${course.title} ${course.subtitle}`,
        description: course.overview,
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const course = await loadCourse(params.slug);
    if (!course) notFound();

    return (
        <SiteLayout>
            <CourseDetailHero course={course} />
            <CourseBody course={course} />
        </SiteLayout>
    );
}