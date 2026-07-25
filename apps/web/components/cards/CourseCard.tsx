'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = {
    course: Course;
    href?: string;
};

export default function CourseCard({ course, href }: Props) {
    const target = href ?? `/training/${course.slug}`;
    return (
        <Link href={target as any} className="course-card" aria-label={`${course.title} ${course.subtitle}`}>
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