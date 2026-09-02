'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, FileText, Inbox } from 'lucide-react';
import { adminFetch, type AdminOverview, UnauthorizedError } from '../../lib/adminClient';

export default function AdminOverviewPage() {
    const [data, setData] = useState<AdminOverview | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        adminFetch<AdminOverview>('/admin/overview')
            .then(setData)
            .catch((err) => {
                if (!(err instanceof UnauthorizedError)) setError(err.message);
            });
    }, []);

    const newCount = data?.enquiries?.new ?? 0;

    const cards: Array<{ label: string; value: number | string; icon: typeof Inbox; href: Route }> = [
        { label: 'New enquiries', value: newCount, icon: Inbox, href: '/admin/enquiries' },
        { label: 'Courses in catalogue', value: data?.courses ?? '—', icon: BookOpen, href: '/admin/courses' },
        { label: 'Upcoming events', value: data?.upcomingEvents ?? '—', icon: CalendarDays, href: '/admin/events' },
        { label: 'Published posts', value: data?.publishedPosts ?? '—', icon: FileText, href: '/admin/posts' },
    ];

    return (
        <div className="admin-page">
            <header className="admin-page-head">
                <span className="kicker">CONSOLE</span>
                <h1>Overview</h1>
            </header>
            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}
            <div className="admin-cards">
                {cards.map(({ label, value, icon: Icon, href }) => (
                    <Link key={label} href={href} className="admin-card">
                        <Icon />
                        <strong>{value}</strong>
                        <span>{label}</span>
                    </Link>
                ))}
            </div>
            <p className="admin-hint">
                Enquiries from the website contact form land in the CRM under <Link href="/admin/enquiries">Enquiries</Link>.
                Move each one new → contacted → qualified → closed as you follow up.
            </p>
        </div>
    );
}
