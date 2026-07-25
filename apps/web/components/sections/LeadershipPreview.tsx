import WhiteButton from '../actions/WhiteButton';
import Reveal from '../motion/Reveal';
import LeaderPortrait from '../brand/LeaderPortrait';

export default function LeadershipPreview() {
    return (
        <section className="leader-preview">
            <div className="wrap leader-grid">
                <Reveal>
                    <LeaderPortrait className="leader-portrait" />
                </Reveal>
                <Reveal delay={0.1}>
                    <div>
                        <span className="kicker">LEADERSHIP</span>
                        <h2>Learning led by experience, grounded in practice.</h2>
                        <h3>Adeyinka Oladimeji MSc</h3>
                        <p className="role">Founder &amp; Lead Trainer</p>
                        <p>
                            PECB Certified Trainer · ISO/IEC 27001 Lead Auditor · Cybersecurity Educator &amp;
                            Governance Advisor
                        </p>
                        <WhiteButton href="/leadership">Meet our founder</WhiteButton>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}