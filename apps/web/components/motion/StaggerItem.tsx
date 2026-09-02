'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { motionTokens } from '../../lib/motion/tokens';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function StaggerItem({ children, className }: Props) {
    const reduce = useReducedMotion();
    if (reduce) return <div className={className}>{children}</div>;

    const variants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: motionTokens.duration.normal, ease: motionTokens.ease.enter },
        },
    };

    return (
        <motion.div className={className} variants={variants}>
            {children}
        </motion.div>
    );
}