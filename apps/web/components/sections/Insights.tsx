import type { Route } from 'next';
import TextLink from '../actions/TextLink';
import InsightCard from '../cards/InsightCard';
import Reveal from '../motion/Reveal';
import StaggerGroup from '../motion/StaggerGroup';
import StaggerItem from '../motion/StaggerItem';

const items: Array<{ category: string; readTime: string; title: string; excerpt: string; href: Route }> = [
    {
        category: 'AI GOVERNANCE',
        readTime: '6 MIN READ',
        title: 'The Future of AI Governance in Africa',
        excerpt: 'What responsible AI oversight looks like as African regulators, boards, and builders define the rules of the road.',
        href: '/research',
    },
    {
        category: 'LEADERSHIP',
        readTime: '6 MIN READ',
        title: 'Why Cybersecurity Leadership Matters',
        excerpt: 'Boards increasingly treat cyber risk as a standing agenda item — here is the leadership fluency they now expect.',
        href: '/research',
    },
    {
        category: 'CYBERSECURITY',
        readTime: '6 MIN READ',
        title: 'Understanding ISO 27001 for Organizations',
        excerpt: 'From scoping your ISMS to surviving the certification audit — the practical sequence that actually works.',
        href: '/research',
    },
];

export default function Insights() {
    return (
        <section className="insights">
            <div className="wrap">
                <Reveal>
                    <div className="section-head">
                        <div>
                            <span className="kicker dark">RESEARCH &amp; INSIGHTS</span>
                            <h2>
                                Ideas shaping <em>digital leadership.</em>
                            </h2>
                        </div>
                        <TextLink href="/research">All insights</TextLink>
                    </div>
                </Reveal>
                <StaggerGroup className="insight-grid">
                    {items.map((it) => (
                        <StaggerItem key={it.title}>
                            <InsightCard {...it} />
                        </StaggerItem>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
}