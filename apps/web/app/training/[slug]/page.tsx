import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteLayout from '../../../components/SiteLayout';
import JsonLd from '../../../components/JsonLd';
import CourseDetailHero from '../../../components/course/CourseDetailHero';
import CourseBody from '../../../components/course/CourseBody';
import FamilyLadder from '../../../components/course/FamilyLadder';
import RelatedCourses from '../../../components/course/RelatedCourses';
import CourseActionPanel from '../../../components/course/CourseActionPanel';
import CareerOutcomes from '../../../components/course/CareerOutcomes';
import WaitlistCTA from '../../../components/course/WaitlistCTA';
import { getCourseBySlug, getCourses } from '../../../lib/data';
import { courseJsonLd } from '../../../lib/jsonld';
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
    const isPecb = course.subtitle.includes('PECB');
    return {
        title: `${course.title} ${course.subtitle}`,
        description: isPecb
            ? `${course.overview} Official PECB certification course delivered in Nigeria by Ykay Consulting Hub, an Authorized Partner of PECB.`
            : course.overview,
        alternates: { canonical: `/training/${course.slug}` },
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);
    if (!course) notFound();
    const courses = await getCourses();

    const isPecb = course.subtitle.includes('PECB');

    return (
        <SiteLayout>
            <JsonLd data={courseJsonLd(course)} />
            <CourseDetailHero course={course} />
            {isPecb && (
                <div className="wrap" style={{ marginTop: 18 }}>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: 'var(--cdrl-text-dark)',
                            background: 'rgba(0,0,0,.03)',
                            border: '1px solid var(--cdrl-line)',
                            borderRadius: 10,
                            padding: '10px 14px',
                        }}
                    >
                        This is an official PECB certification programme, delivered under our{' '}
                        <Link href="/pecb-signs-partnership-agreement-with-ykay-consulting-hub" className="text-link">
                            PECB partnership
                        </Link>{' '}
                        —{' '}
                        <Link href="/partnerships" className="text-link">
                            see the full PECB portfolio
                        </Link>
                        .
                    </p>
                </div>
            )}
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
