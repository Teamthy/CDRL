import { Mail, MapPin } from 'lucide-react';
import { PhoneContactLinks } from '../contact/WhatsAppLink';

export default function ContactInfo() {
    return (
        <div className="contact-info">
            <h2>Training enquiries</h2>
            <p>
                <Mail aria-hidden="true" /> <a href="mailto:info@ykayconsultinghub.com.ng">info@ykayconsultinghub.com.ng</a>
            </p>
            <p>
                <PhoneContactLinks />
            </p>
            <p>
                <MapPin aria-hidden="true" /> Lagos, Nigeria
            </p>
            <p>
                <a href="https://www.linkedin.com/in/yinka-oladimeji-ab9401208/" target="_blank" rel="noreferrer noopener">
                    Connect on LinkedIn ↗
                </a>
            </p>
        </div>
    );
}