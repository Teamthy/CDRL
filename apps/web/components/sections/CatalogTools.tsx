'use client';

import { Search } from 'lucide-react';
import type { Course } from '../../lib/content';

export type CatalogFilter = string;

type Props = {
    courses: Course[];
    query: string;
    filter: CatalogFilter;
    onQueryChange: (value: string) => void;
    onFilterChange: (value: CatalogFilter) => void;
};

export default function CatalogTools({ courses, query, filter, onQueryChange, onFilterChange }: Props) {
    // Chips derived from live data — catalogue tracks (PECB's 11 categories + curated tracks)
    // without me having to hardcode strings, so /training always mirrors whatever is seeded.
    const tracks = ['All', ...Array.from(new Set(courses.map((c) => c.track))).sort()];
    const counts = new Map<string, number>();
    for (const c of courses) counts.set(c.track, (counts.get(c.track) ?? 0) + 1);

    return (
        <div className="catalog-tools">
            <div className="wrap">
                <div className="catalog-search">
                    <Search aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search programs, standards, tracks, levels…"
                        aria-label="Search professional programs"
                    />
                </div>
                <div className="catalog-chips" role="group" aria-label="Filter by track">
                    {tracks.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => onFilterChange(f)}
                            className={`filter-btn ${filter === f ? 'active' : ''}`.trim()}
                            aria-pressed={filter === f}
                        >
                            {f}
                            {f !== 'All' && (
                                <span className="filter-count" aria-hidden="true">
                                    {counts.get(f) ?? 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
