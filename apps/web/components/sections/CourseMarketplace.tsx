'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CatalogTools, { type CatalogFilter } from './CatalogTools';
import CourseCard from '../cards/CourseCard';
import type { Course } from '../../lib/content';

type Props = { courses: Course[] };

const PAGE_SIZE = 24;

export default function CourseMarketplace({ courses }: Props) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<CatalogFilter>('All');
    const [page, setPage] = useState(1);

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
                            <nav className="market-pager" aria-label="Catalogue pagination">
                                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                                    <ChevronLeft aria-hidden="true" /> Prev
                                </button>
                                <span aria-current="page">
                                    Page {safePage} of {totalPages}
                                </span>
                                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
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
