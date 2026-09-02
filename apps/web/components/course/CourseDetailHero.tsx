import type { Route } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Reveal from '../motion/Reveal';
import type { Course } from '../../lib/content';
import { courseHeroImageFor } from '../../lib/courseImages';

export default function CourseDetailHero({ course }: { course: Course }) {
    const isPecb = course.subtitle.includes('PECB');
    return (
        <section className="course-detail course-detail-img course-detail-pecb">
            <div
                className="course-detail-bg"
                aria-hidden="true"
                style={{ backgroundImage: `url(${courseHeroImageFor(course.track, course.slug)})` }}
            />
            <div className="wrap">
                <nav className="crumbs" aria-label="Breadcrumb">
                    <Link href={"/" as Route} className="crumb">Home</Link>
                    <ChevronRight aria-hidden="true" />
                    <Link href={"/training" as Route} className="crumb">Training</Link>
                    <ChevronRight aria-hidden="true" />
                    <span className="crumb current" aria-current="page">{course.title}</span>
                </nav>
                <Reveal>
                    <span className="kicker">
                        {course.track} · {course.level}
                        {isPecb ? ' · PECB Certified Course' : ''}
                    </span>
                    <h1>
                        {course.title}
                        {course.subtitle ? (
                            <>
                                <br />
                                <em>{course.subtitle}</em>
                            </>
                        ) : null}
                    </h1>
                    <p>
                        {course.overview ||
                            'Build practical competence through expert-led instruction, structured learning materials, and applied assessment.'}
                    </p>
                    <div className="hero-cta">
                        <a href="#enrol" className="hero-cta-primary">Apply for this training</a>
                        <Link href={"/training" as Route} className="hero-cta-ghost">
                            <ArrowLeft aria-hidden="true" /> Back to all programmes
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
