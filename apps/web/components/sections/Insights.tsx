import TextLink from '../actions/TextLink';
import InsightCard from '../cards/InsightCard';
import Reveal from '../motion/Reveal';
import StaggerGroup from '../motion/StaggerGroup';
import StaggerItem from '../motion/StaggerItem';

const items = [
    {
        category: 'AI GOVERNANCE',
        readTime: '6 MIN READ',
        title: 'The Future of AI Governance in Africa',
        excerpt: 'Practical perspective for leaders navigating an increasingly complex digital landscape.',
        href: '/research',
    },
    {
        category: 'LEADERSHIP',
        readTime: '6 MIN READ',
        title: 'Why Cybersecurity Leadership Matters',
        excerpt: 'Practical perspective for leaders navigating an increasingly complex digital landscape.',
        href: '/research',
    },
    {
        category: 'CYBERSECURITY',
        readTime: '6 MIN READ',
        title: 'Understanding ISO 27001 for Organizations',
        excerpt: 'Practical perspective for leaders navigating an increasingly complex digital landscape.',
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