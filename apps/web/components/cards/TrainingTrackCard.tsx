'use client';

import type { Route } from 'next';

import Link from 'next/link';
import { ArrowRight, Landmark, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react';

export type TrackIconName = 'ShieldCheck' | 'Landmark' | 'Sparkles' | 'Users';

const iconMap: Record<TrackIconName, LucideIcon> = {
    ShieldCheck,
    Landmark,
    Sparkles,
    Users,
};

type Props = {
    number: number;
    title: string;
    description: string;
    icon: TrackIconName;
    href: Route;
};

export default function TrainingTrackCard({ number, title, description, icon, href }: Props) {
    const Icon = iconMap[icon];
    return (
        <Link href={href} className="track-card">
            <span className="track-num">0{number}</span>
            <Icon className="track-icon" aria-hidden="true" />
            <h3>{title}</h3>
            <p>{description}</p>
            <ArrowRight className="track-arrow" aria-hidden="true" />
        </Link>
    );
}