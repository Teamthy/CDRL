'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, FileText, GraduationCap, Inbox } from 'lucide-react';
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

            {/* patch-45: intake pipeline chart — 30-day application volume */}
            {data?.applicationsSeries && (
                <section className="admin-chart-card" aria-label="New applications, last 30 days">
                    <header>
                        <span className="kicker">INTAKE PIPELINE</span>
                        <h2>Applications, last 30 days</h2>
                        <p className="admin-sub">
                            {data.applicationsSeries.reduce((a, d) => a + d.count, 0)} total · student sign-ups roll
                            up by day
                        </p>
                    </header>
                    <Sparkline points={data.applicationsSeries.map((d) => d.count)} />
                    <StatusBuckets buckets={data.applications ?? {}} />
                </section>
            )}
            <p className="admin-hint">
                Enquiries from the website contact form land in the CRM under <Link href="/admin/enquiries">Enquiries</Link>.
                Move each one new → contacted → qualified → closed as you follow up.
            </p>
        </div>
    );
}

type SparkProps = { points: number[] };
/** Inline SVG sparkline — no chart lib needed, matches the "true dashboard" card. */
function Sparkline({ points }: SparkProps) {
    const w = 560;
    const h = 120;
    const max = Math.max(1, ...points);
    const stepX = points.length > 1 ? (w - 20) / (points.length - 1) : 0;
    const xy = points.map((v, i) => [10 + i * stepX, h - 14 - (v / max) * (h - 30)] as const);
    const path = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const area = `${path} L ${w - 10} ${h - 14} L 10 ${h - 14} Z`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="admin-spark" role="img" aria-label="30-day application trend">
            <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#70F250" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#70F250" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sparkFill)" />
            <path d={path} fill="none" stroke="#70F250" strokeWidth="2.2" strokeLinecap="round" />
            {[0.5, 1].map((r) => (
                <line key={r} x1="10" x2={w - 10} y1={14 + r * (h - 30) * 0.5} y2={14 + r * (h - 30) * 0.5}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />
            ))}
        </svg>
    );
}

function StatusBuckets({ buckets }: { buckets: Record<string, number> }) {
    const ordered: { key: string; label: string }[] = [
        { key: 'new', label: 'New' },
        { key: 'contacted', label: 'Contacted' },
        { key: 'reviewing', label: 'Reviewing' },
        { key: 'admitted', label: 'Admitted' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'closed', label: 'Closed' },
    ];
    return (
        <ul className="admin-buckets" aria-label="Application status buckets">
            {ordered.map(({ key, label }) => (
                <li key={key}>
                    <strong>{buckets[key] ?? 0}</strong>
                    <span>{label}</span>
                </li>
            ))}
        </ul>
    );
}
