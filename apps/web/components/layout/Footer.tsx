import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import Logo from '../brand/Logo';
import WhiteButton from '../actions/WhiteButton';
import { PhoneContactLinks } from '../contact/WhatsAppLink';
import { DEFAULT_FOOTER_CTA, type FooterCta } from '../../lib/pageCta';

const columns = [
    {
        heading: 'Training',
        links: [
            { label: 'Cybersecurity', href: '/training' },
            { label: 'GRC', href: '/training' },
            { label: 'AI Governance', href: '/training' },
            { label: 'Executive Leadership', href: '/training' },
        ],
    },
    {
        heading: 'For Organizations',
        links: [
            { label: 'Corporate Training', href: '/corporate-training' },
            { label: 'Advisory', href: '/advisory' },
            { label: 'Partnerships', href: '/partnerships' },
            { label: 'Digital Risk Assessments', href: '/advisory' },
        ],
    },
    {
        heading: 'YKAY Consult',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Research', href: '/research' },
            { label: 'Events', href: '/events' },
            { label: 'Contact', href: '/contact' },
        ],
    },
] as const;

/**
 * @param cta Footer call-to-action, or `false` for pages that already have
 * their own contact CTA (see lib/pageCta.ts — one contact CTA per page).
 */
export default function Footer({ cta = DEFAULT_FOOTER_CTA }: { cta?: FooterCta }) {
    const year = new Date().getFullYear();
    return (
        <footer className="site-footer">
            <div className="wrap footer-intro">
                <Logo />
                <p>Professional education for cybersecurity, governance, AI risk, and digital leadership.</p>
                {cta ? <WhiteButton href={cta.href}>{cta.label}</WhiteButton> : null}
            </div>
            <div className="wrap footer-cols">
                {columns.map((col) => (
                    <div key={col.heading}>
                        <h4>{col.heading}</h4>
                        {col.links.map((link) => (
                            <Link key={`${col.heading}-${link.label}`} href={link.href}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                ))}
                <div className="footer-contact">
                    <h4>Contact</h4>
                    <p>
                        <Mail /> <a href="mailto:info@ykayconsultinghub.com.ng">info@ykayconsultinghub.com.ng</a>
                    </p>
                    <p>
                        <PhoneContactLinks />
                    </p>
                    <p>
                        <MapPin /> Lagos, Nigeria · Serving Africa
                    </p>
                </div>
                <div className="footer-partner">
                    <h4>Our Partner</h4>
                    <a
                        href="https://pecb.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ykay Consulting Hub is a PECB Authorized Partner — visit pecb.com"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/assets/pecb-authorized-partner.jpg" alt="PECB Authorized Partner" width={92} height={110} />
                        <span>PECB Authorized Partner</span>
                    </a>
                </div>
            </div>
            <div className="wrap legal">
                <span>© {year} YKAY Consult · Centre for Digital Risk &amp; Leadership.</span>
                <span className="legal-links">
                    <Link href={'/privacy'}>Privacy</Link>
                    <Link href={'/terms'}>Terms</Link>
                    <Link href={'/accessibility'}>Accessibility</Link>
                </span>
            </div>
            <div className="wrap trademark">
                <span>
                    PECB®, ISO/IEC 27001® and related marks are trademarks of PECB Group Inc. Ykay Consulting Hub is an
                    Authorized Partner of PECB.
                </span>
            </div>
        </footer>
    );
}