'use client';

import { Search } from 'lucide-react';

const filters = ['All', 'Cybersecurity', 'GRC', 'AI Governance', 'Executive Leadership'] as const;
export type CatalogFilter = (typeof filters)[number];

type Props = {
    query: string;
    filter: CatalogFilter;
    onQueryChange: (value: string) => void;
    onFilterChange: (value: CatalogFilter) => void;
};

export default function CatalogTools({ query, filter, onQueryChange, onFilterChange }: Props) {
    return (
        <div className="catalog-tools">
            <div className="wrap">
                <div className="catalog-search">
                    <Search aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search professional programs"
                        aria-label="Search professional programs"
                    />
                </div>
                {filters.map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => onFilterChange(f)}
                        className={`filter-btn ${filter === f ? 'active' : ''}`.trim()}
                        aria-pressed={filter === f}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>
    );
}