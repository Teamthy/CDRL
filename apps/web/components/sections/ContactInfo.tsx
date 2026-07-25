import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactInfo() {
    return (
        <div className="contact-info">
            <h2>Training enquiries</h2>
            <p>
                <Mail aria-hidden="true" /> <a href="mailto:training@cdrl.africa">training@cdrl.africa</a>
            </p>
            <p>
                <Phone aria-hidden="true" /> <a href="tel:+2340000000000">+234 (0) 000 000 0000</a>
            </p>
            <p>
                <MapPin aria-hidden="true" /> Lagos, Nigeria
            </p>
            <p>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer noopener">
                    Connect on LinkedIn ↗
                </a>
            </p>
        </div>
    );
}