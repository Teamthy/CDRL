'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { navigationLinks } from './navigation';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function MobileNavigation({ open, onClose }: Props) {
    const pathname = usePathname();
    const firstLinkRef = useRef<HTMLAnchorElement>(null);

    // Move focus into the dialog when it opens; close on Escape.
    useEffect(() => {
        if (!open) return;
        firstLinkRef.current?.focus();
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div id="mobile-navigation" className="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="wrap">
                {navigationLinks.map((item, i) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            ref={i === 0 ? firstLinkRef : undefined}
                            href={item.href}
                            className={active ? 'active' : ''}
                            onClick={onClose}
                        >
                            <span>{item.label}</span>
                            <ArrowRight />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
