import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '../motion/Reveal';

type Props = {
    heading?: string;
    ctaLabel?: string;
    ctaHref?: Route;
};

export default function CTASection({
    heading = 'Ready to take the next step?',
    ctaLabel = 'Talk to CDRL',
    ctaHref = '/contact',
}: Props) {
    return (
        <section className="page-cta">
            <div className="wrap">
                <Reveal>
                    <h2>{heading}</h2>
                </Reveal>
                <Reveal delay={0.08}>
                    <Link href={ctaHref} className="btn btn-primary">
                        <span>{ctaLabel}</span>
                        <ArrowRight />
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}