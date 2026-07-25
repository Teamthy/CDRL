import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function SectionHeading({ children, className = '' }: Props) {
    return <h2 className={className}>{children}</h2>;
}