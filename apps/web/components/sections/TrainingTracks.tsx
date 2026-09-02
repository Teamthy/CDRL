import type { Route } from 'next';
import OutlineButton from '../actions/OutlineButton';
import TrainingTrackCard, { type TrackIconName } from '../cards/TrainingTrackCard';
import Reveal from '../motion/Reveal';
import StaggerGroup from '../motion/StaggerGroup';
import StaggerItem from '../motion/StaggerItem';

type Track = {
    title: string;
    description: string;
    icon: TrackIconName;
    href: Route;
};

const tracks: Track[] = [
    {
        title: 'Cybersecurity',
        description: 'Build practical information security and cyber resilience capabilities.',
        icon: 'ShieldCheck',
        href: '/training',
    },
    {
        title: 'Governance, Risk & Compliance',
        description: 'Strengthen enterprise risk, compliance, and governance practices.',
        icon: 'Landmark',
        href: '/training',
    },
    {
        title: 'AI Governance & Digital Ethics',
        description: 'Lead responsible AI adoption with confidence and accountability.',
        icon: 'Sparkles',
        href: '/training',
    },
    {
        title: 'Executive Leadership',
        description: 'Equip boards and leaders to govern technology and digital risk.',
        icon: 'Users',
        href: '/training',
    },
];

export default function TrainingTracks() {
    return (
        <section className="track-section">
            <div className="wrap">
                <Reveal>
                    <div className="section-head">
                        <div>
                            <span className="kicker">OUR TRAINING TRACKS</span>
                            <h2>
                                Expertise for every layer of <em>digital trust.</em>
                            </h2>
                        </div>
                        <OutlineButton href="/training">View all programs</OutlineButton>
                    </div>
                </Reveal>
                <StaggerGroup className="track-grid">
                    {tracks.map((t, i) => (
                        <StaggerItem key={t.title}>
                            <TrainingTrackCard
                                number={i + 1}
                                title={t.title}
                                description={t.description}
                                icon={t.icon}
                                href={t.href}
                            />
                        </StaggerItem>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
}