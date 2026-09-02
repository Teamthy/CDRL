import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import EditorialRows from '../../components/sections/EditorialRows';
import CTASection from '../../components/sections/CTASection';
import Reveal from '../../components/motion/Reveal';
import { CalendarDays, MapPin } from 'lucide-react';
import { getPageContent, getPublishedEvents } from '../../lib/data';
import { pageData } from '../../lib/content';

export const revalidate = 1800;

export const metadata = {
    title: 'Events & Masterclasses',
    description: 'Upcoming certification programs, executive briefings, and practitioner masterclasses.',
    alternates: { canonical: '/events' },
};

function eventDate(iso: string) {
    const d = new Date(iso);
    return {
        day: d.toLocaleDateString('en-NG', { weekday: 'long' }),
        label: d.toLocaleDateString('en-NG', { dateStyle: 'long' }),
    };
}

/** Events published from the admin console. Hidden entirely when none exist. */
async function PublishedEvents() {
    const events = await getPublishedEvents();
    if (events.length === 0) return null;
    const exams = events.filter((e) => e.eventType === 'exam');
    const others = events.filter((e) => e.eventType !== 'exam');
    return (
        <section className="db-events">
            <div className="wrap">
                <span className="kicker">UPCOMING DATES</span>
                <h2>Scheduled programs &amp; events</h2>
                <div className="db-events-grid">
                    {(others.length ? others : events).map((ev) => {
                        const d = eventDate(ev.startsAt);
                        return (
                            <Reveal key={ev.id}>
                                <article className="db-event-card">
                                    <span className="db-event-when">
                                        <CalendarDays aria-hidden="true" /> {d.day}, {d.label}
                                    </span>
                                    <h3>{ev.title}</h3>
                                    <p>{ev.summary}</p>
                                    <div className="db-event-meta">
                                        {ev.location && (
                                            <span>
                                                <MapPin aria-hidden="true" /> {ev.location}
                                            </span>
                                        )}
                                        {ev.endsAt && (
                                            <span>until {eventDate(ev.endsAt).label}</span>
                                        )}
                                    </div>
                                    {ev.registrationUrl ? (
                                        <a className="text-link" href={ev.registrationUrl} target="_blank" rel="noopener noreferrer">
                                            <span>Register now</span>
                                        </a>
                                    ) : (
                                        <a className="text-link" href={`/contact?interest=${encodeURIComponent(ev.slug)}`}>
                                            <span>Enquire about this event</span>
                                        </a>
                                    )}
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
                {exams.length > 0 && (
                    <div className="exam-strip">
                        <span className="kicker">EXAM SESSIONS</span>
                        <h3>Certification exams on the calendar</h3>
                        <p className="exam-rules">
                            PECB exams are online-proctored or in-person per cohort; they follow the current PECB
                            Examination Rules and Policies, and one free retake is included in the standard policy.
                        </p>
                        <div className="exam-row-grid">
                            {exams.map((ev) => {
                                const d = eventDate(ev.startsAt);
                                return (
                                    <div key={ev.id} className="exam-card">
                                        <strong>{ev.title}</strong>
                                        <span>
                                            {d.day}, {d.label}
                                        </span>
                                        {ev.location && <span>{ev.location}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default async function EventsPage() {
    const content = (await getPageContent('Events')) ?? pageData['Events'];

    return (
        <SiteLayout>
            <PageHero eyebrow={content.kicker} title={content.title} description={content.description} />
            <PublishedEvents />
            <EditorialRows blocks={content.blocks} />
            <CTASection heading="Register for an upcoming program." ctaLabel="Enquire about a program" />
        </SiteLayout>
    );
}
