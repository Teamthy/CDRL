'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { navigationLinks } from './navigation';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function MobileNavigation({ open, onClose }: Props) {
    const pathname = usePathname();
    if (!open) return null;

    return (
        <div id="mobile-navigation" className="mobile-nav" role="dialog" aria-label="Mobile navigation">
            <div className="wrap">
                {navigationLinks.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href as any}
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