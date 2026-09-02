import { Check, Clock3, Globe2, MonitorPlay, BadgeCheck, CalendarClock, FileText, Package } from 'lucide-react';
import Reveal from '../motion/Reveal';
import ModuleText from '../learn/ModuleText';
import AddToPlanButton from '../actions/AddToPlanButton';
import ApplyCard from './ApplyCard';
import PayCard from './PayCard';
import CourseToc from './CourseToc';
import EmployerFunding from './EmployerFunding';
import PriceBandCard from './PriceBandCard';
import type { Course } from '../../lib/content';
import { levelMetaFor, richDetailsFor } from '../../lib/courseDetails';

const receiveItems = [
    'Expert-led learning experience',
    'Digital course materials',
    'Practical exercises and case studies',
    'Assessment and completion credential',
    'Continued access through the CDRL learning portal',
];

export default function CourseBody({ course }: { course: Course }) {
    const meta = levelMetaFor(course.level);
    const details = richDetailsFor(course);
    return (
        <section className="course-body">
            <div className="wrap">
                <ul className="detail-meta-band" aria-label="Programme facts">
                    <li>
                        <CalendarClock aria-hidden="true" />
                        <span>
                            <strong>{meta.days}</strong>
                            <small>Live instruction</small>
                        </span>
                    </li>
                    <li>
                        <FileText aria-hidden="true" />
                        <span>
                            <strong>{meta.exam}</strong>
                            <small>Certification exam</small>
                        </span>
                    </li>
                    <li>
                        <BadgeCheck aria-hidden="true" />
                        <span>
                            <strong>{meta.cpd}</strong>
                            <small>Continuing education</small>
                        </span>
                    </li>
                    <li>
                        <Package aria-hidden="true" />
                        <span>
                            <strong>Materials included</strong>
                            <small>Official courseware</small>
                        </span>
                    </li>
                </ul>
            </div>
            <div className="wrap course-body-grid">
                <Reveal className="course-toc-wrap">
                    <CourseToc course={course} />
                    <aside className="toc-fact-card" aria-label="Programme summary">
                        <span className="toc-fact-kicker">AT A GLANCE</span>
                        <dl>
                            <div><dt>Level</dt><dd>{course.level}</dd></div>
                            <div><dt>Duration</dt><dd>{meta.days}</dd></div>
                            <div><dt>Exam</dt><dd>{meta.exam}</dd></div>
                            <div><dt>Credits</dt><dd>{meta.cpd}</dd></div>
                            <div><dt>Delivery</dt><dd>{course.deliveryMode}</dd></div>
                            <div><dt>Track</dt><dd>{course.track}</dd></div>
                        </dl>
                        <a href="#enrol" className="toc-fact-cta">Apply for this training</a>
                    </aside>
                </Reveal>
                <Reveal className="course-main-col">
                    <div>
                        <div className="course-details">
                            <ModuleText text={details} anchorIds />
                        </div>
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
