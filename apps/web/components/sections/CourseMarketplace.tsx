'use client';

import { useMemo, useState } from 'react';
import CatalogTools, { type CatalogFilter } from './CatalogTools';
import CourseCard from '../cards/CourseCard';
import type { Course } from '../../lib/content';

type Props = { courses: Course[] };

export default function CourseMarketplace({ courses }: Props) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<CatalogFilter>('All');

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return courses.filter((c) => {
            const matchesFilter = filter === 'All' || c.track === filter;
            if (!matchesFilter) return false;
            if (!q) return true;
            return `${c.title} ${c.subtitle} ${c.track} ${c.level} ${c.mode}`.toLowerCase().includes(q);
        });
    }, [courses, query, filter]);

    return (
        <>
            <CatalogTools query={query} filter={filter} onQueryChange={setQuery} onFilterChange={setFilter} />
            <section className="market-grid">
                {shown.length === 0 ? (
                    <div className="wrap">
                        <div className="empty-state">
                            <p>No programs match your search. Try a different keyword or reset filters.</p>
                        </div>
                    </div>
                ) : (
                    <div className="wrap">
                        {shown.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}