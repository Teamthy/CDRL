import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Props = {
    message?: string;
    ctaLabel?: string;
    ctaHref?: string;
};

export default function AnnouncementBar({
    message = 'Registration is open for our June 2026 certification cohort',
    ctaLabel = 'View programs',
    ctaHref = '/events',
}: Props) {
    return (
        <div className="notice" role="region" aria-label="Announcement">
            <span>{message}</span>
            <Link href={ctaHref as any}>
                {ctaLabel} <ArrowRight />
            </Link>
        </div>
    );
}