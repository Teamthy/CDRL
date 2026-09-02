'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
    children: ReactNode;
    href?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
};

/** Green-on-black button used on dark surfaces (Corporate band, Leadership CTA). */
export default function WhiteButton({ children, href, onClick, className = '' }: Props) {
    const cls = `btn btn-white ${className}`.trim();
    const content = (
        <>
            <span>{children}</span>
            <ArrowRight />
        </>
    );
    if (href) {
        return (
            <Link href={href as any} className={cls}>
                {content}
            </Link>
        );
    }
    return (
        <button type="button" onClick={onClick} className={cls}>
            {content}
        </button>
    );
}