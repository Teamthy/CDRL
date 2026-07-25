'use client';

import type { Route } from 'next';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
    children: ReactNode;
    href?: Route;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
};

export default function OutlineButton({ children, href, onClick, className = '' }: Props) {
    const cls = `btn btn-outline ${className}`.trim();
    const content = (
        <>
            <span>{children}</span>
            <ArrowRight />
        </>
    );
    if (href) {
        return (
            <Link href={href} className={cls}>
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