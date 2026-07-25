'use client';

import Link from 'next/link';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
    children: ReactNode;
    href?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    type?: 'button' | 'submit';
};

export default function SecondaryButton({ children, href, onClick, className = '', type = 'button' }: Props) {
    const cls = `btn btn-secondary ${className}`.trim();
    if (href) {
        return (
            <Link href={href as any} className={cls}>
                <span>{children}</span>
            </Link>
        );
    }
    return (
        <button type={type} onClick={onClick} className={cls}>
            <span>{children}</span>
        </button>
    );
}