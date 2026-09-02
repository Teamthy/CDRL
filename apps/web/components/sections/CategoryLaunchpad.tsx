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
    const heroes = byTrack.slice(0, 2);
    const rest = byTrack.slice(2, 6);

    const Tile = ({ track, n, hero }: { track: string; n: number; hero?: boolean }) => (
        <button key={track} type="button" className={`cat-tile${hero ? ' hero' : ''}`} onClick={() => onPick(track)}>
            <span className="cat-bg" aria-hidden="true" style={{ backgroundImage: `url(${courseImageFor(track)})` }} />
            <span className="cat-meta">
                <strong>{track}</strong>
                <small>
                    {n} programme{n === 1 ? '' : 's'}
                </small>
            </span>
            <ArrowRight aria-hidden="true" />
        </button>
    );

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
                    {heroes.map(([t, n]) => (
                        <Tile key={t} track={t} n={n} hero />
                    ))}
                </div>
                <div className="cat-row">
                    {rest.map(([t, n]) => (
                        <Tile key={t} track={t} n={n} />
                    ))}
                </div>
            </div>
        </section>
    );
}
