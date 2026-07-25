import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    tone?: 'light' | 'dark';
    className?: string;
};

export default function Eyebrow({ children, tone = 'light', className = '' }: Props) {
    return <span className={`kicker ${tone === 'dark' ? 'dark' : ''} ${className}`}>{children}</span>;
}