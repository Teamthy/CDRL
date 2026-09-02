'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { Award, Check } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = { courses: Course[]; currentSlug: string };

/** PECB-style sibling-level ladder: for a course like "ISO/IEC 27001 Lead Auditor",
 *  shows "ISO/IEC 27001 Foundation · Lead Implementer · Lead Auditor · Transition"
 *  so users can move across the credential ladder just like on pecb.com. */
export default function FamilyLadder({ courses, currentSlug }: Props) {
    const current = courses.find((c) => c.slug === currentSlug);
    if (!current) return null;
    const family = current.title;
    const siblings = courses
        .filter((c) => c.title === family)
        .sort((a, b) => a.level.localeCompare(b.level));
    if (siblings.length <= 1) return null;

    return (
        <section className="family-ladder" aria-label={`Credential levels for ${family}`}>
            <div className="wrap">
                <span className="kicker">{current.subtitle.includes('PECB') ? 'PECB CERTIFIED LEVELS' : 'PROGRAMME LEVELS'}</span>
                <h2>Available {family} training courses</h2>
                <p className="family-sub">
                    {current.subtitle.includes('PECB')
                        ? 'Delivered by Ykay Consulting Hub, a PECB Authorized Partner. Pick the level that fits your career stage.'
                        : 'Pick the level that fits your career stage.'}
                </p>
                <div className="family-grid">
                    {siblings.map((c) => {
                        const isCurrent = c.slug === currentSlug;
                        return (
                            <Link
                                key={c.id}
                                href={`/training/${c.slug}` as Route}
                                className={`family-chip ${isCurrent ? 'current' : ''}`}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                {isCurrent ? <Check aria-hidden="true" /> : <Award aria-hidden="true" />}
                                <div>
                                    <strong>{c.subtitle}</strong>
                                    <span>{c.level}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
