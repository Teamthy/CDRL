import type { Metadata } from 'next';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import Reveal from '../../components/motion/Reveal';
import JsonLd from '../../components/JsonLd';
import { newsArticleJsonLd, SITE_URL } from '../../lib/jsonld';
import Link from 'next/link';

const CANONICAL = '/pecb-signs-partnership-agreement-with-ykay-consulting-hub';

export const metadata: Metadata = {
    title: 'PECB Signs a Partnership Agreement with Ykay Consulting Hub',
    description:
        'PECB, an ISO certification and training company, announced a partnership agreement with Ykay Consulting Hub to provide best practices of ISO standards in Nigeria — information security, cybersecurity, AI management, business continuity, and ISO management systems.',
    alternates: { canonical: CANONICAL },
    other: { 'article:published_time': '2026-08-06' },
};

export default function PecpPressReleasePage() {
    return (
        <SiteLayout>
            <JsonLd
                data={newsArticleJsonLd({
                    headline: 'PECB Signs a Partnership Agreement with Ykay Consulting Hub',
                    description:
                        'PECB, an ISO certification and training company, announced a partnership agreement with Ykay Consulting Hub to provide best practices of ISO standards in Nigeria.',
                    datePublished: '2026-08-06T08:00:00+01:00',
                    url: `${SITE_URL}${CANONICAL}`,
                    image: `${SITE_URL}/assets/pecb-authorized-partner.jpg`,
                })}
            />
            <PageHero
                eyebrow="PRESS RELEASE"
                title="PECB Signs a Partnership Agreement with Ykay Consulting Hub"
                description="06 August 2026 · Lagos, Nigeria"
            />
            <article className="pr-article">
                <div className="wrap">

                    <Reveal>
                        <p className="pr-lede">
                            <strong>06th August, 2026</strong> — PECB, an ISO certification and training company,
                            announced that they have recently signed a partnership agreement with Ykay Consulting Hub.
                            This partnership will deliver significant benefits to enterprises by providing best
                            practices of ISO standards in Nigeria. This partnership will bring expertise and knowledge,
                            in turn expanding our ability to provide a full spectrum of services so our customers can
                            gain great value from PECB training courses.
                        </p>
                    </Reveal>

                    <Reveal>
                        <blockquote>
                            “By partnering with Ykay Consulting Hub, we will expand our business, helping our customers
                            stay ahead and add value to their operations. The Nigeria market has an exciting future
                            ahead of it. Our fundamental focus is always helping our clients build, grow, and protect
                            their businesses. In particular, we appreciate the collaborative spirit of Ykay Consulting
                            Hub, the focus on customer service, and the consistent growth over the years.”
                            <cite>— Tim Rama, CEO of PECB</cite>
                        </blockquote>
                    </Reveal>

                    <Reveal>
                        <h2>A statement from Ykay Consulting Hub</h2>
                        <p>
                            “We are delighted to partner with PECB, a globally recognized provider of professional
                            training and certification services. This partnership strengthens our commitment to helping
                            professionals and organizations build competence, manage risk, and improve their operations
                            through internationally recognized standards.
                        </p>
                        <p>
                            Through this collaboration, Ykay Consulting Hub looks forward to expanding access to quality
                            PECB training in Nigeria, particularly across information security, cybersecurity,
                            artificial intelligence management, business continuity, and other ISO management systems.
                            We are excited about the value this partnership will bring to professionals and
                            organizations.”
                        </p>
                        <p className="pr-attribution">
                            — <strong>Adeyinka Oladimeji</strong>, Lead Trainer, Ykay Consulting Hub
                        </p>
                    </Reveal>

                    <Reveal>
                        <h2>About PECB</h2>
                        <p>
                            PECB is a certification body that provides education, certification, and certificate
                            programs for individuals in a wide range of disciplines. PECB helps professionals and
                            organizations demonstrate commitment and competence by providing valuable education,
                            evaluation, certification, and certificate programs aligned with rigorous, internationally
                            recognized standards. Its mission is to provide clients with comprehensive services that
                            inspire trust, continual improvement, demonstrate recognition, and benefit society as a
                            whole. For further information about PECB’s principal objectives and activities, visit{' '}
                            <a href="https://pecb.com" target="_blank" rel="noopener noreferrer">
                                pecb.com
                            </a>
                            .
                        </p>
                    </Reveal>

                    <Reveal>
                        <h2>About Ykay Consulting Hub</h2>
                        <p>
                            Ykay Consulting Hub is a professional training and consulting organization focused on
                            helping individuals and organizations build competence, manage digital risks, and
                            strengthen governance through internationally recognized standards. Its services span
                            information security, cybersecurity, artificial intelligence management, business
                            continuity, and other ISO management systems.
                        </p>
                        <p>
                            Led by Adeyinka Oladimeji, an experienced educator, IT professional, PECB Certified Trainer,
                            and ISO/IEC 27001 Lead Auditor, Ykay Consulting Hub combines technology, education, and
                            professional development to deliver practical, value-driven learning and advisory services.
                        </p>
                    </Reveal>

                    <Reveal>
                        <footer className="pr-links">
                            <a href="https://pecb.com" target="_blank" rel="noopener noreferrer">
                                Visit PECB’s official website
                            </a>
                            <span aria-hidden="true">·</span>
                            <a
                                href="https://pecb.com/en/newsReleases/pecb-signs-a-partnership-agreement-with-ykay-consulting-hub"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Read this release on pecb.com
                            </a>
                            <span aria-hidden="true">·</span>
                            <Link href="/">Back to Ykay Consulting Hub</Link>
                        </footer>
                    </Reveal>
                </div>
            </article>
        </SiteLayout>
    );
}
