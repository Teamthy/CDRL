'use client';

import type { Route } from 'next';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    href: Route;
    tone?: 'dark' | 'light';
    className?: string;
};

export default function TextLink({ children, href, tone = 'dark', className = '' }: Props) {
    return (
        <Link href={href} className={`text-link ${tone === 'light' ? 'light' : ''} ${className}`.trim()}>
            <span>{children}</span>
            <ArrowRight />
        </Link>
    );
}