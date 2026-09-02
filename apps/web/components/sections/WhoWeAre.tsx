import TextLink from '../actions/TextLink';
import Reveal from '../motion/Reveal';

export default function WhoWeAre() {
    return (
        <section className="authority">
            <div className="wrap">
                <Reveal>
                    <div>
                        <span className="kicker dark">WHO WE ARE</span>
                        <h2>
                            Building the professionals who will secure and govern{' '}
                            <em>Africa&apos;s digital future.</em>
                        </h2>
                    </div>
                </Reveal>
                <Reveal delay={0.1}>
                    <div>
                        <p>
                            CDRL is a professional eLearning and advisory platform equipping individuals and
                            organizations with practical knowledge, globally recognized frameworks, and leadership
                            capabilities.
                        </p>
                        <TextLink href="/about">Discover CDRL</TextLink>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}