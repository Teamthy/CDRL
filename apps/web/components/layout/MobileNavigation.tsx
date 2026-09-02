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
                    const active =
                        pathname === item.href ||
                        (item.children?.some((child) => child.href === pathname) ?? false);
                    return (
                        <div key={item.href} className="mobile-nav-group">
                            <Link
                                ref={i === 0 ? firstLinkRef : undefined}
                                href={item.href}
                                className={active ? 'active' : ''}
                                onClick={onClose}
                            >
                                <span>{item.label}</span>
                                <ArrowRight />
                            </Link>
                            {item.children?.map((child) => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    className={`mobile-sub ${pathname === child.href ? 'active' : ''}`.trim()}
                                    onClick={onClose}
                                >
                                    <span>{child.label}</span>
                                    <ArrowRight />
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
