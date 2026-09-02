'use client';

import type { Route } from 'next';

import Link from 'next/link';
import { ArrowRight, Clock3, MapPin } from 'lucide-react';

type Props = {
    dates: string;
    monthYear: string;
    title: string;
    location: string;
    duration: string;
    ctaLabel?: string;
    href: Route;
};

export default function EventCard({
    dates,
    monthYear,
    title,
    location,
    duration,
    ctaLabel = 'Register Now',
    href,
}: Props) {
    // Render the month/year on two lines WITHOUT dangerouslySetInnerHTML —
    // if this value ever comes from a CMS it must never become an XSS sink.
    const [month, ...rest] = monthYear.split(' ');
    return (
        <section className="upcoming">
            <div className="wrap">
                <div className="event-date">
                    <b>{dates}</b>
                    <span>
                        {month}
                        <br />
                        {rest.join(' ')}
                    </span>
                </div>
                <div>
                    <span className="kicker dark">UPCOMING PROGRAM</span>
                    <h2>{title}</h2>
                    <p>
                        <MapPin aria-hidden="true" /> {location}
                        <span className="meta-sep">·</span>
                        <Clock3 aria-hidden="true" /> {duration}
                    </p>
                </div>
                <Link href={href} className="btn btn-primary">
                    <span>{ctaLabel}</span>
                    <ArrowRight />
                </Link>
            </div>
        </section>
    );
}
