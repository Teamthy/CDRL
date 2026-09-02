'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Course } from '../../lib/content';
import { courseImageFor } from '../../lib/courseImages';

const PAGE_SIZE = 12;

type Props = { courses: Course[] };

/** /partnerships portfolio — PECB course grid with backdrop imagery and pager. */
export default function PecbPortfolioShowcase({ courses }: Props) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
    const items = useMemo(
        () => courses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [courses, page],
    );
    const jump = (n: number) => {
        setPage(n);
        document.getElementById('pecb-portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section className="pecb-portfolio" id="pecb-portfolio">
            <div className="wrap">
                <span className="kicker">PECB CERTIFIED PORTFOLIO</span>
                <h2>Programmes delivered under our PECB partnership</h2>
                <p className="pecb-credit">
                    Official PECB certification courses, delivered by Ykay Consulting Hub and concluded with the PECB
                    certification exam. Exact scope and titles follow the{' '}
                    <a href="https://pecb.com/en/education-and-certification" target="_blank" rel="noopener noreferrer">
                        PECB catalogue
                    </a>
                    .
                </p>

                <p className="pecb-count" aria-live="polite">
                    Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, courses.length)}</strong> of{' '}
                    <strong>{courses.length}</strong> PECB programmes
                </p>

                <div className="pecb-portfolio-grid">
                    {items.map((c) => (
                        <Link
                            key={c.id}
                            href={`/training/${c.slug}` as Route}
                            className="pecb-course-card pecb-course-card-img"
                        >
                            <span
                                className="pecb-card-bg"
                                aria-hidden="true"
                                style={{ backgroundImage: `url(${courseImageFor(c.track, c.slug)})` }}
                            />
                            <span className="pecb-card-content">
                                <span className="pecb-course-meta">{c.level}</span>
                                <span className="pecb-course-title">{c.title}</span>
                                <span className="pecb-course-sub">{c.subtitle}</span>
                            </span>
                        </Link>
                    ))}
                </div>

                {totalPages > 1 && (
                    <nav className="market-pager market-pager-full" aria-label="Portfolio pagination">
                        <button type="button" className="pager-nav" onClick={() => jump(page - 1)} disabled={page === 1}>
                            <ChevronLeft aria-hidden="true" /> Prev
                        </button>
                        <div className="pager-pages" role="list">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    role="listitem"
                                    className={`pager-num ${n === page ? 'on' : ''}`}
                                    aria-current={n === page ? 'page' : undefined}
                                    onClick={() => jump(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="pager-nav"
                            onClick={() => jump(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next <ChevronRight aria-hidden="true" />
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
}
