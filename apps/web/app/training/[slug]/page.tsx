import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
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
import { courseJsonLd, SITE_URL } from '../../../lib/jsonld';
import { courses as localCourses } from '../../../lib/content';


export const revalidate = 1800;

type ReadLink = { href: string; label: string };

const GUIDE_LINKS: { match: RegExp; link: ReadLink }[] = [
    { match: /^iso-iec-27001/, link: { href: '/news/iso-27001-training-in-nigeria-foundation-lead-implementer-or-lead-auditor', label: 'ISO 27001 Training in Nigeria: choosing your level' } },
    { match: /^(iso-iec-42001|ai-)/, link: { href: '/news/what-is-iso-42001-ai-governance-training-nigeria', label: 'What is ISO 42001 and why AI governance matters' } },
    { match: /^(iso-22301|crisis|disaster)/, link: { href: '/news/business-continuity-training-nigeria-iso-22301', label: 'Business continuity training: what ISO 22301 prepares you for' } },
    { match: /^cybersecurity/, link: { href: '/news/cybersecurity-training-nigeria-choosing-a-certification-path', label: 'Cybersecurity training in Nigeria: choosing a path' } },
    { match: /^(gdpr|dora)/, link: { href: '/data-protection-nigeria', label: 'Data protection & NDPA training in Nigeria' } },
];

function readNextFor(slug: string, isPecb: boolean): ReadLink[] {
    const out: ReadLink[] = [];
    if (isPecb) out.push({ href: '/pecb-certification-nigeria', label: 'How PECB certification works' });
    if (/^iso/i.test(slug)) out.push({ href: '/iso-training-nigeria', label: 'ISO training in Nigeria — all standards' });
    for (const g of GUIDE_LINKS) if (g.match.test(slug)) out.push(g.link);
    if (isPecb) out.push({ href: '/news/how-to-get-pecb-certification-in-nigeria', label: 'How to get PECB certification in Nigeria' });
    const seen = new Set<string>();
    return out.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true))).slice(0, 3);
}

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
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Training', item: `${SITE_URL}/training` },
                        { '@type': 'ListItem', position: 2, name: course.track, item: `${SITE_URL}/training` },
                        { '@type': 'ListItem', position: 3, name: `${course.title} ${course.subtitle}` },
                    ],
                }}
            />
            <nav className="crumbs wrap" aria-label="Breadcrumb">
                <Link href="/training">Training</Link>
                <span className="sep" aria-hidden="true">›</span>
                <span>{course.track}</span>
                <span className="sep" aria-hidden="true">›</span>
                <span>{course.title} {course.subtitle}</span>
            </nav>
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
                        <Link href="/pecb-training-nigeria" className="text-link">
                            explore PECB training in Nigeria
                        </Link>{' '}
                        or{' '}
                        <Link href="/partnerships" className="text-link">
                            see the full portfolio
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
            {readNextFor(slug, !!isPecb).length > 0 && (
                <div className="wrap read-next">
                    <span className="kicker">READ NEXT</span>
                    <ul>
                        {readNextFor(slug, !!isPecb).map((l) => (
                            <li key={l.href}>
                                <Link href={l.href as Route} className="text-link">
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="wrap waitlist-strip">
                <WaitlistCTA course={course} />
            </div>
        </SiteLayout>
    );
}
