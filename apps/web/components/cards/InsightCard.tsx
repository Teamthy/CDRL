'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Props = {
    category: string;
    readTime: string;
    title: string;
    excerpt: string;
    href: string;
};

export default function InsightCard({ category, readTime, title, excerpt, href }: Props) {
    return (
        <Link href={href as any} className="insight-card">
            <span>
                {category} · {readTime}
            </span>
            <h3>{title}</h3>
            <p>{excerpt}</p>
            <ArrowRight aria-hidden="true" />
        </Link>
    );
}