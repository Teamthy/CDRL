import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '../motion/Reveal';

/**
 * PECB Authorized Partner band on the homepage.
 * PECB partnership requirement: badge visible on the homepage near the
 * training/certification content, hyperlinked to https://pecb.com.
 */
export default function PecbPartner() {
    return (
        <section className="pecb-partner">
            <div className="wrap pecb-grid">
                <Reveal className="pecb-copy">
                    <span className="kicker">PARTNERSHIP</span>
                    <h2>
                        PECB Authorized <em>Partner.</em>
                    </h2>
                    <p>
                        Ykay Consulting Hub is an Authorized Partner of PECB, providing access to internationally
                        recognized professional training and certification programmes across information security,
                        cybersecurity, AI management, business continuity and ISO management systems.
                    </p>
                    <Link href="/pecb-signs-partnership-agreement-with-ykay-consulting-hub" className="text-link">
                        <span>Read the press release</span>
                        <ArrowRight />
                    </Link>
                    <Link href="/pecb-training-nigeria" className="text-link">
                        <span>Explore PECB training in Nigeria</span>
                        <ArrowRight />
                    </Link>
                    <p className="pecb-credit">
                        PECB®, ISO/IEC 27001® and related marks are trademarks of PECB Group Inc. Ykay Consulting Hub
                        is an Authorized Partner of PECB; courses are delivered per PECB brand guidelines.{' '}
                        <a href="https://pecb.com" target="_blank" rel="noopener noreferrer">
                            pecb.com
                        </a>
                    </p>
                </Reveal>
                <Reveal className="pecb-badge-wrap" delay={0.1}>
                    <a
                        className="pecb-badge"
                        href="https://pecb.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="PECB Authorized Partner — visit pecb.com"
                    >
                        <Image
                            src="/assets/pecb-authorized-partner.jpg"
                            alt="PECB Authorized Partner"
                            width={512}
                            height={610}
                            style={{ width: '150px', height: 'auto', display: 'block' }}
                        />
                        <span className="pecb-badge-caption">PECB Authorized Partner</span>
                    </a>
                </Reveal>
            </div>
        </section>
    );
}
