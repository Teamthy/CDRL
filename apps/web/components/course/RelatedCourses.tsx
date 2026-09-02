'use client';

import { useEffect, useRef, useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { Course } from '../../lib/content';
import { courseImageFor } from '../../lib/courseImages';

type Props = { courses: Course[]; currentSlug: string };

/** Auto-scrolling related-courses rail (PECB-style "More programmes") on course pages.
 *  Related = same track first, then same leading title token (same ISO family), then others. */
export default function RelatedCourses({ courses, currentSlug }: Props) {
    const railRef = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(false);

    const related = (() => {
        const current = courses.find((c) => c.slug === currentSlug);
        if (!current) return courses.slice(0, 12);
        const family = current.title.toLowerCase();
        const sameFamily = courses.filter((c) => c.slug !== currentSlug && c.title.toLowerCase() === family);
        const sameTrack = courses.filter((c) => c.slug !== currentSlug && c.track === current.track && c.title.toLowerCase() !== family);
        const others = courses.filter((c) => c.slug !== currentSlug && c.track !== current.track);
        return [...sameFamily, ...sameTrack, ...others].slice(0, 16);
    })();

    // Gentle autoscroll; pauses on hover / focus / toggle.
    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => {
            const el = railRef.current;
            if (!el) return;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
            el.scrollBy({ left: atEnd ? -el.scrollWidth : 320, behavior: 'smooth' });
        }, 3800);
        return () => clearInterval(id);
    }, [paused]);

    const nudge = (dir: 1 | -1) => railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

    if (related.length === 0) return null;

    return (
        <section
            className="related-rail"
            aria-label="Related programmes"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <div className="wrap">
                <div className="related-head">
                    <div>
                        <span className="kicker">KEEP EXPLORING</span>
                        <h2>Related programmes</h2>
                    </div>
                    <div className="related-controls">
                        <button type="button" onClick={() => nudge(-1)} aria-label="Scroll related courses left">
                            <ChevronLeft />
                        </button>
                        <button type="button" onClick={() => nudge(1)} aria-label="Scroll related courses right">
                            <ChevronRight />
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaused((p) => !p)}
                            aria-pressed={!paused}
                            aria-label={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
                        >
                            {paused ? <Play /> : <Pause />}
                        </button>
                    </div>
                </div>
                <div className="related-track" ref={railRef} tabIndex={0}>
                    {related.map((c) => (
                        <Link key={c.id} href={`/training/${c.slug}` as Route} className="related-card">
                            <div
                                className="related-card-img"
                                aria-hidden="true"
                                style={{ backgroundImage: `url(${courseImageFor(c.track, c.slug)})` }}
                            />
                            <span className="related-track-label">{c.track}</span>
                            <strong>
                                {c.title} <em>{c.subtitle}</em>
                            </strong>
                            <span className="related-go">
                                View <ArrowRight aria-hidden="true" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
