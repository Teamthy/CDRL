'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    className?: string;
    stagger?: number;
    delayChildren?: number;
};

export default function StaggerGroup({ children, className, stagger = 0.07, delayChildren = 0.05 }: Props) {
    const reduce = useReducedMotion();
    if (reduce) return <div className={className}>{children}</div>;

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger, delayChildren } },
            }}
        >
            {children}
        </motion.div>
    );
}