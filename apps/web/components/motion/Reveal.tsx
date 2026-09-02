'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { motionTokens } from '../../lib/motion/tokens';

type Props = {
    children: ReactNode;
    delay?: number;
    className?: string;
    as?: 'div' | 'section' | 'article' | 'span';
};

export default function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
    const reduce = useReducedMotion();
    const MotionTag = motion[as] as any;

    if (reduce) {
        return <MotionTag className={className}>{children}</MotionTag>;
    }

    const variants: Variants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: motionTokens.duration.slow,
                ease: motionTokens.ease.enter,
                delay,
            },
        },
    };

    return (
        <MotionTag
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={variants}
        >
            {children}
        </MotionTag>
    );
}