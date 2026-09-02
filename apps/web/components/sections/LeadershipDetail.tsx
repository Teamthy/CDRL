import Reveal from '../motion/Reveal';
import LeaderPortrait from '../brand/LeaderPortrait';

export default function LeadershipDetail() {
    return (
        <section className="leadership-page">
            <div className="wrap">
                <Reveal>
                    <LeaderPortrait />
                </Reveal>
                <Reveal delay={0.08}>
                    <div>
                        <span className="kicker">FOUNDER &amp; LEAD TRAINER</span>
                        <h2>Adeyinka Oladimeji MSc</h2>
                        <p className="roles">
                            PECB Certified Trainer · ISO/IEC 27001 Lead Auditor · Cybersecurity Educator &amp;
                            Governance Advisor
                        </p>
                        <p>
                            Adeyinka brings professional expertise in information security, governance, and
                            leadership development to every CDRL engagement. His work helps professionals move
                            beyond theory and enables organizations to build practical, sustainable digital trust
                            capabilities.
                        </p>
                        <blockquote>
                            &ldquo;Africa&apos;s digital future depends on leaders who understand both opportunity and
                            responsibility.&rdquo;
                        </blockquote>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}