'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Course } from '../../lib/content';
import { courseImageFor } from '../../lib/courseImages';

type Props = {
    courses: Course[];
    onPick: (track: string) => void;
};

/** PECB-style category launchpad over the listing: big image tiles per track
 *  with course counts. Clicking a tile filters the marketplace below. */
export default function CategoryLaunchpad({ courses, onPick }: Props) {
    const byTrack = useMemo(() => {
        const m = new Map<string, number>();
        for (const c of courses) m.set(c.track, (m.get(c.track) ?? 0) + 1);
        return [...m.entries()].sort((a, b) => b[1] - a[1]);
    }, [courses]);

    if (byTrack.length === 0) return null;
    const a = byTrack.slice(0, 2);
    const b = byTrack.slice(2, 6);
    const c = byTrack.slice(6);

    return (
        <section className="cat-launch" aria-label="Browse by category">
            <div className="wrap">
                <span className="kicker">TRAIN AND CERTIFY</span>
                <h2>
                    International mastery, <em>delivered locally.</em>
                </h2>
                <p className="cat-sub">
                    Every programme below is delivered by Ykay Consulting Hub, a PECB Authorized Partner — with
                    certification exams issued and verified by PECB.
                </p>

                <div className="cat-row heroes">
                    {a.map(([track, n]) => (
                        <button key={track} type="button" className="cat-tile hero" onClick={() => onPick(track)}>
                            <span
                                className="cat-bg"
                                aria-hidden="true"
                                style={{ backgroundImage: `url(${courseImageFor(track)})` }}
                            />
                            <span className="cat-meta">
                                <strong>{track}</strong>
                                <small>{n} programmes</small>
                            </span>
                            <ArrowRight aria-hidden="true" />
                        </button>
                    ))}
                </div>
                <div className="cat-row">
                    {b.map(([track, n]) => (
                        <button key={track} type="button" className="cat-tile" onClick={() => onPick(track)}>
                            <span
                                className="cat-bg"
                                aria-hidden="true"
                                style={{ backgroundImage: `url(${courseImageFor(track)})` }}
                            />
                            <span className="cat-meta">
                                <strong>{track}</strong>
                                <small>{n}</small>
                            </span>
                        </button>
                    ))}
                </div>
                {c.length > 0 && (
                    <div className="cat-chips">
                        {c.map(([track, n]) => (
                            <button key={track} type="button" className="filter-btn" onClick={() => onPick(track)}>
                                {track} <span className="filter-count">{n}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
