'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { announceSearch } from '../../lib/siteSearch';

type Props = {
    open: boolean;
    onClose: () => void;
};

/**
 * Header search (audit UX-16).
 *
 * The input used to carry nothing but a ref, a placeholder and an aria-label —
 * no value, no onChange, no form, no submit handler and nowhere to show
 * results. Typing into it and pressing Enter did nothing at all, which reads
 * as a broken site rather than a missing feature.
 *
 * It now submits to the catalogue, which already has the filtering UI; the
 * panel's job is just to get the query there.
 */
export default function SearchPanel({ open, onClose }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/training?q=${encodeURIComponent(q)}` : '/training');
        announceSearch(q);
        setQuery('');
        onClose();
    }

    return (
        // `id` matches the header button's aria-controls, which previously
        // pointed at an element that did not exist.
        <div className="site-search" id="site-search-panel" role="search">
            <form className="wrap" onSubmit={handleSubmit} role="none">
                <input
                    ref={inputRef}
                    type="search"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search courses, insights, and programs"
                    placeholder="Search courses, insights, and programs..."
                />
                <button type="submit" aria-label="Search">
                    <Search aria-hidden="true" />
                </button>
            </form>
        </div>
    );
}
