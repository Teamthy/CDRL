'use client';

import type { Route } from 'next';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = {
    course: Course;
    href?: Route;
};

export default function CourseCard({ course, href }: Props) {
    // Dynamic catalog link — runtime slug: narrow once at this dynamic boundary.
    const target: Route = href ?? (`/training/${course.slug}` as Route);
    return (
        <Link href={target} className="course-card" aria-label={`${course.title} ${course.subtitle}`}>
            <div className="course-meta">
                <span>{course.track}</span>
                <span>{course.deliveryMode}</span>
            </div>
            <div className="course-icon" aria-hidden="true">
                <BookOpen />
            </div>
            <h3>
                {course.title}
                <b>{course.subtitle}</b>
            </h3>
            <div className="course-bottom">
                <span>{course.level}</span>
                <ArrowRight aria-hidden="true" />
            </div>
        </Link>
    );
}