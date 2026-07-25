import type { ElementType, ReactNode } from 'react';

type Props = {
    children: ReactNode;
    as?: ElementType;
    className?: string;
};

export default function DisplayHeading({ children, as: Tag = 'h1', className = '' }: Props) {
    return <Tag className={`display-heading ${className}`}>{children}</Tag>;
}