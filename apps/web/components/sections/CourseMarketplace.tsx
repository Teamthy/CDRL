'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CatalogTools, { type CatalogFilter } from './CatalogTools';
import CategoryLaunchpad from './CategoryLaunchpad';
import CourseCard from '../cards/CourseCard';
import type { Course } from '../../lib/content';

type Props = { courses: Course[] };

const PAGE_SIZE = 16;   // 4 × 4 per page

export default function CourseMarketplace({ courses }: Props) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<CatalogFilter>('All');
    const [page, setPage] = useState(1);
    const marketRef = { current: null as HTMLDivElement | null };

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return courses.filter((c) => {
            const matchesFilter = filter === 'All' || c.track === filter;
            if (!matchesFilter) return false;
            if (!q) return true;
            return `${c.title} ${c.subtitle} ${c.track} ${c.level} ${c.deliveryMode}`.toLowerCase().includes(q);
        });
    }, [courses, query, filter]);

    const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // industry-standard numbered window around the current page
    const pageWindow = useMemo(() => {
        const window_: (number | '…')[] = [];
        const radius = 2;
        const push = (n: number) => window_.push(n);
        const dots = () => { if (window_[window_.length - 1] !== '…') window_.push('…'); };
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= safePage - radius && i <= safePage + radius)) push(i);
            else dots();
        }
        return window_;
    }, [totalPages, safePage]);

    const jumpTo = (n: number) => {
        setPage(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const changeFilter = (f: CatalogFilter) => {
        setFilter(f);
        setPage(1);
    };
    const changeQuery = (q: string) => {
        setQuery(q);
        setPage(1);
    };

    return (
        <>
            <CategoryLaunchpad
                courses={courses}
                onPick={(track) => {
                    changeFilter(track);
                    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
            />
            <div id="catalogue" />
            <CatalogTools courses={courses} query={query} filter={filter} onQueryChange={changeQuery} onFilterChange={changeFilter} />
            <section className="market-grid">
                {shown.length === 0 ? (
                    <div className="wrap">
                        <div className="empty-state">
                            <p>No programs match your search. Try a different keyword or reset filters.</p>
                        </div>
                    </div>
                ) : (
                    <div className="wrap">
                        <p className="market-count" aria-live="polite">
                            Showing <strong>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, shown.length)}</strong> of{' '}
                            <strong>{shown.length}</strong> programmes
                        </p>
                        <div className="market-cards">
                            {pageItems.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <nav className="market-pager market-pager-full" aria-label="Catalogue pagination">
                                <button type="button" onClick={() => jumpTo(safePage - 1)} disabled={safePage === 1} className="pager-nav">
                                    <ChevronLeft aria-hidden="true" /> Prev
                                </button>
                                <div className="pager-pages" role="list">
                                    {pageWindow.map((n, i) =>
                                        n === '…' ? (
                                            <span key={`d${i}`} className="pager-ellipsis" aria-hidden="true">…</span>
                                        ) : (
                                            <button
                                                key={n}
                                                type="button"
                                                role="listitem"
                                                onClick={() => jumpTo(n)}
                                                aria-current={n === safePage ? 'page' : undefined}
                                                className={`pager-num ${n === safePage ? 'on' : ''}`}
                                            >
                                                {n}
                                            </button>
                                        ),
                                    )}
                                </div>
                                <button type="button" onClick={() => jumpTo(safePage + 1)} disabled={safePage === totalPages} className="pager-nav">
                                    Next <ChevronRight aria-hidden="true" />
                                </button>
                            </nav>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}
