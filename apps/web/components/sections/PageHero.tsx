import type { ReactNode } from 'react';
import Reveal from '../motion/Reveal';

type Props = {
    eyebrow: string;
    title: ReactNode;
    description?: string;
    children?: ReactNode;
};

export default function PageHero({ eyebrow, title, description, children }: Props) {
    return (
        <section className="page-hero">
            <div className="wrap">
                <Reveal>
                    <span className="kicker">{eyebrow}</span>
                    <h1>{title}</h1>
                    {description && <p>{description}</p>}
                    {children}
                </Reveal>
            </div>
        </section>
    );
}