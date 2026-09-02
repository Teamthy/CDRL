import { BookOpen, CalendarDays, FileText, Globe2 } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = { course: Course };

/** PECB-style action strip between detail body and related rail:
 *  brochures, events, enroll, partner note. */
export default function CourseActionPanel({ course }: Props) {
    const isPecb = course.subtitle.includes('PECB');
    return (
        <section className="course-actions" aria-label="Course resources and next steps">
            <div className="wrap course-actions-grid">
                <a
                    className="action-tile"
                    href="https://pecb.com/en/education-and-certification-for-individuals"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <BookOpen aria-hidden="true" />
                    <strong>View training brochures</strong>
                    <span>Official PECB programme brochures and outlines</span>
                </a>
                <a
                    className="action-tile"
                    href="https://pecb.com/en/events"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <CalendarDays aria-hidden="true" />
                    <strong>View all training events</strong>
                    <span>Upcoming sessions across our partner network</span>
                </a>
                <a className="action-tile" href="#enrol">
                    <FileText aria-hidden="true" />
                    <strong>Get started — apply now</strong>
                    <span>Reserve your seat; we confirm dates and format</span>
                </a>
                <div className="action-tile action-note">
                    <Globe2 aria-hidden="true" />
                    <strong>Delivered by Ykay Consulting Hub</strong>
                    <span>
                        {isPecb
                            ? 'A PECB Authorized Partner. Credential issued directly by PECB and verifiable online.'
                            : 'Professional training designed for African organizations and careers.'}
                    </span>
                </div>
            </div>
        </section>
    );
}
