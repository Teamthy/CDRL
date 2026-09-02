'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
    children: ReactNode;
    href?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    icon?: ReactNode;
    className?: string;
    type?: 'button' | 'submit';
    ariaLabel?: string;
};

export default function PrimaryButton({
    children,
    href,
    onClick,
    icon,
    className = '',
    type = 'button',
    ariaLabel,
}: Props) {
    const cls = `btn btn-primary ${className}`.trim();
    const content = (
        <>
            <span>{children}</span>
            {icon ?? <ArrowRight />}
        </>
    );
    if (href) {
        return (
            <Link href={href as any} className={cls} aria-label={ariaLabel}>
                {content}
            </Link>
        );
    }
    return (
        <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel}>
            {content}
        </button>
    );
}