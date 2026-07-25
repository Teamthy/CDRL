'use client';

import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function SearchPanel({ open, onClose }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="site-search" role="search">
            <div className="wrap">
                <input
                    ref={inputRef}
                    aria-label="Search courses, insights, and programs"
                    placeholder="Search courses, insights, and programs..."
                />
                <Search aria-hidden="true" />
            </div>
        </div>
    );
}