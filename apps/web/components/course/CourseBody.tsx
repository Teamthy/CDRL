import { Check, Clock3, Globe2, MonitorPlay } from 'lucide-react';
import Reveal from '../motion/Reveal';
import ModuleText from '../learn/ModuleText';
import AddToPlanButton from '../actions/AddToPlanButton';
import ApplyCard from './ApplyCard';
import PayCard from './PayCard';
import CourseToc from './CourseToc';
import EmployerFunding from './EmployerFunding';
import PriceBandCard from './PriceBandCard';
import type { Course } from '../../lib/content';

const receiveItems = [
    'Expert-led learning experience',
    'Digital course materials',
    'Practical exercises and case studies',
    'Assessment and completion credential',
    'Continued access through the CDRL learning portal',
];

export default function CourseBody({ course }: { course: Course }) {
    return (
        <section className="course-body">
            <div className="wrap course-body-grid">
                <Reveal className="course-toc-wrap">
                    <CourseToc course={course} />
                </Reveal>
                <Reveal className="course-main-col">
                    <div>
                        <h2 id="overview">Course overview</h2>
                        <p>
                            {course.overview ||
                                'This professional program equips participants with the knowledge, tools, and confidence to apply internationally recognized practices within their organizations.'}
                        </p>
                        {course.details ? (
                            <div className="course-details">
                                <ModuleText text={course.details} anchorIds />
                            </div>
                        ) : null}
                        <h3 id="what-you-receive">What you receive</h3>
                        {receiveItems.map((item) => (
                            <p key={item} className="tick">
                                <Check aria-hidden="true" />
                                {item}
                            </p>
                        ))}
                        <h3 id="delivery">Delivery &amp; flexibility</h3>
                        <p>
                            Programs run on a flexible schedule with virtual, in-person, and hybrid delivery
                            options tailored to the audience. Corporate enrollment is available for teams.
                        </p>
                    </div>
                </Reveal>
                <Reveal delay={0.08} className="course-aside-col">
                    <div className="course-side-stack">
                        <aside id="enrol">
                            <PriceBandCard course={course} />
                            <span>DELIVERY</span>
                            <h4>Enrollment</h4>
                            <p>
                                <MonitorPlay aria-hidden="true" /> {course.deliveryMode}
                            </p>
                            <p>
                                <Clock3 aria-hidden="true" /> Learn on a flexible schedule
                            </p>
                            <p>
                                <Globe2 aria-hidden="true" /> Available across Africa
                            </p>
                            <AddToPlanButton courseId={course.id} />
                            <ApplyCard course={course} />
                            <PayCard course={course} />
                            <small>Corporate enrollment available for teams.</small>
                        </aside>
                        <EmployerFunding courseTitle={`${course.title} ${course.subtitle}`} />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
