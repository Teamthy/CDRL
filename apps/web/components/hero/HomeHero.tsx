'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motionTokens } from '../../lib/motion/tokens';

export default function HomeHero() {
    const reduce = useReducedMotion();
    const fade = (delay: number) =>
        reduce
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: motionTokens.duration.slow, ease: motionTokens.ease.enter, delay },
            };

    return (
        <section className="hero">
            <div className="wrap hero-grid">
                <div className="hero-copy">
                    <motion.span className="eyebrow" {...fade(0.05)}>
                        CENTRE FOR DIGITAL RISK &amp; LEADERSHIP
                    </motion.span>

                    <motion.h1 {...fade(0.12)}>
                        Advancing Trust in the <em>Digital Age.</em>
                    </motion.h1>

                    <motion.p {...fade(0.2)}>
                        Professional certification training in cybersecurity, governance, AI risk, and digital
                        leadership—built for Africa&apos;s evolving digital economy.
                    </motion.p>

                    <motion.div className="hero-ctas" {...fade(0.28)}>
                        <Link href={'/training'} className="btn btn-primary">
                            <span>Explore Training Programs</span>
                            <ArrowRight />
                        </Link>
                        <Link href={'/corporate-training'} className="btn btn-secondary">
                            <span>Book Corporate Training</span>
                        </Link>
                    </motion.div>

                    <motion.div className="hero-proof" {...fade(0.36)}>
                        <div>
                            <b>4</b>
                            <span>Specialist learning tracks</span>
                        </div>
                        <div>
                            <b>14+</b>
                            <span>Professional programs</span>
                        </div>
                        <div>
                            <b>Global</b>
                            <span>Standards, African context</span>
                        </div>
                    </motion.div>
                </div>


            </div>
        </section>
    );
}