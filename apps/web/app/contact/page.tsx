import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import ContactInfo from '../../components/sections/ContactInfo';
import ContactForm from '../../components/sections/ContactForm';

export const metadata = {
    title: 'Contact',
    description: 'Tell us how CDRL can support your professional or organizational goals.',
};

export default function ContactPage() {
    return (
        <SiteLayout>
            <PageHero
                eyebrow="CONTACT"
                title="Let's build digital trust together."
                description="Tell us how CDRL can support your professional or organizational goals."
            />
            <section className="contact-page">
                <div className="wrap">
                    <ContactInfo />
                    <ContactForm />
                </div>
            </section>
        </SiteLayout>
    );
}