'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Decorative background carousel for the home hero. Crossfades five
 * brand-themed images served by the Unsplash CDN (decorative only —
 * hidden from assistive tech). Honors prefers-reduced-motion by
 * freezing on the first slide.
 *
 * To change images: replace the photo IDs below with any valid URL.
 */
const SLIDES = [
    // Cybersecurity
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1920&q=70',
    // AI governance
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1920&q=70',
    // Privacy / ISO compliance (documents & audit trail)
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=70',
    // Executive leadership & training delivery
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=70',
    // Business continuity & resilient operations
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=70',
] as const;

const INTERVAL_MS = 6000;

export default function HeroCarousel() {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (reduce) return; // reduced-motion users get a static first slide
        const id = window.setInterval(() => setActive((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [reduce]);

    return (
        <div className="hero-carousel" aria-hidden="true">
            {SLIDES.map((src, i) => (
                <div
                    key={src}
                    className={`hero-slide${i === active ? ' active' : ''}`}
                    style={{ backgroundImage: `url("${src}")` }}
                />
            ))}
            <div className="hero-media-overlay" />
        </div>
    );
}
