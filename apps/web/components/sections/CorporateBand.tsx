import { Check } from 'lucide-react';
import WhiteButton from '../actions/WhiteButton';
import Reveal from '../motion/Reveal';
import StaggerGroup from '../motion/StaggerGroup';
import StaggerItem from '../motion/StaggerItem';

const services = [
    'Cybersecurity Awareness Training',
    'Executive Cyber Risk Briefings',
    'Digital Risk Assessments',
    'Governance Workshops',
];

export default function CorporateBand() {
    return (
        <section className="corporate-band">
            <div className="wrap corporate-grid">
                <Reveal>
                    <div>
                        <span className="kicker">FOR ORGANIZATIONS</span>
                        <h2>Build a workforce ready for tomorrow&apos;s digital risks.</h2>
                        <p>
                            From cyber awareness to executive briefings, our tailored programs turn digital risk
                            into organizational resilience.
                        </p>
                        <WhiteButton href="/corporate-training">Explore Corporate Training</WhiteButton>
                    </div>
                </Reveal>
                <StaggerGroup className="risk-list">
                    {services.map((service, i) => (
                        <StaggerItem key={service}>
                            <div>
                                <span>{String(i + 1).padStart(2, '0')}</span>
                                <b>{service}</b>
                                <Check aria-hidden="true" />
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
}