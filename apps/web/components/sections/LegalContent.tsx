import type { ReactNode } from 'react';
import Reveal from '../motion/Reveal';

type Section = {
    title: string;
    body: ReactNode;
};

type Props = {
    sections: Section[];
    lastUpdated?: string;
};

export default function LegalContent({ sections, lastUpdated }: Props) {
    return (
        <section className="content-blocks">
            <div className="wrap">
                {lastUpdated && (
                    <Reveal>
                        <p style={{ color: 'var(--cdrl-deep-green)', fontSize: 13, marginBottom: 24 }}>
                            Last updated: {lastUpdated}
                        </p>
                    </Reveal>
                )}
                {sections.map((s, i) => (
                    <Reveal key={s.title} as="article">
                        <span>0{i + 1}</span>
                        <div>
                            <h2>{s.title}</h2>
                            <div style={{ color: 'var(--cdrl-deep-green)', lineHeight: 1.75, fontSize: 15 }}>
                                {s.body}
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}