'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    href: string;
    tone?: 'dark' | 'light';
    className?: string;
};

export default function TextLink({ children, href, tone = 'dark', className = '' }: Props) {
    return (
        <Link href={href as any} className={`text-link ${tone === 'light' ? 'light' : ''} ${className}`.trim()}>
            <span>{children}</span>
            <ArrowRight />
        </Link>
    );
}