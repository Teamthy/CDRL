import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../brand/Logo';
import WhiteButton from '../actions/WhiteButton';

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
            { label: 'Leadership', href: '/leadership' },
            { label: 'Contact', href: '/contact' },
        ],
    },
] as const;

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="site-footer">
            <div className="wrap footer-intro">
                <Logo />
                <p>Professional education for cybersecurity, governance, AI risk, and digital leadership.</p>
                <WhiteButton href="/contact">Talk to our team</WhiteButton>
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
                        <Mail /> <a href="mailto:training@cdrl.africa">training@cdrl.africa</a>
                    </p>
                    <p>
                        <Phone /> <a href="tel:+2348060533847">+2348060533847</a>
                    </p>
                    <p>
                        <MapPin /> Lagos, Nigeria · Serving Africa
                    </p>
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
        </footer>
    );
}