import TextLink from '../actions/TextLink';
import CourseCard from '../cards/CourseCard';
import Reveal from '../motion/Reveal';
import StaggerGroup from '../motion/StaggerGroup';
import StaggerItem from '../motion/StaggerItem';
import type { Course } from '../../lib/content';

type Props = { courses: Course[] };

export default function FeaturedCertifications({ courses }: Props) {
    return (
        <section className="featured">
            <div className="wrap">
                <Reveal>
                    <div className="section-head">
                        <div>
                            <span className="kicker dark">FEATURED CERTIFICATIONS</span>
                            <h2>
                                Start your next <em>professional milestone.</em>
                            </h2>
                        </div>
                        <TextLink href="/training">Browse marketplace</TextLink>
                    </div>
                </Reveal>
                <StaggerGroup className="course-row">
                    {courses.slice(0, 3).map((course) => (
                        <StaggerItem key={course.id}>
                            <CourseCard course={course} />
                        </StaggerItem>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
}