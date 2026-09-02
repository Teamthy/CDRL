import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Reveal from '../motion/Reveal';
import type { Course } from '../../lib/content';
import { courseHeroImageFor } from '../../lib/courseImages';

export default function CourseDetailHero({ course }: { course: Course }) {
    return (
        <section className="course-detail course-detail-img">
            <div
                className="course-detail-bg"
                aria-hidden="true"
                style={{ backgroundImage: `url(${courseHeroImageFor(course.track, course.slug)})` }}
            />
            <div className="wrap">
                <Link href={'/training'} className="back">
                    <ArrowLeft aria-hidden="true" /> Back to training
                </Link>
                <Reveal>
                    <span className="kicker">
                        {course.track} · {course.level}
                    </span>
                    <h1>
                        {course.title}
                        <br />
                        <em>{course.subtitle}</em>
                    </h1>
                    <p>
                        {course.overview ||
                            'Build practical competence through expert-led instruction, structured learning materials, and applied assessment.'}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}