import type { ReactNode } from 'react';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164, enquiryMessage, whatsappUrl } from '../../lib/siteContact';

/*
 * Contact links that open a WhatsApp chat, and the number's call link.
 * No hooks and no client state, so these work from server and client components.
 */

/** The WhatsApp mark, inline because the CSP allows images from 'self' only. */
export function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    );
}

type WhatsAppLinkProps = {
    children: ReactNode;
    /**
     * Accessible name. It must contain the visible text, and the link's
     * behaviour is appended, so a screen-reader user hears "opens WhatsApp".
     */
    label: string;
    /** What the visitor is asking about, prefilled into the chat. Omit for the generic greeting. */
    about?: string;
    className?: string;
};

/** A link to a WhatsApp chat with the business. Opens in a new tab. */
export function WhatsAppLink({ children, label, about, className }: WhatsAppLinkProps) {
    return (
        <a
            href={whatsappUrl(enquiryMessage(about))}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            aria-label={`${label} (opens WhatsApp in a new tab)`}
        >
            {children}
        </a>
    );
}

/** The business number: a WhatsApp chat on the number itself, with a call link beside it. */
export function PhoneContactLinks() {
    return (
        <>
            <WhatsAppIcon /> <WhatsAppLink label={`Chat on WhatsApp: ${CONTACT_PHONE_DISPLAY}`}>{CONTACT_PHONE_DISPLAY}</WhatsAppLink>
            <span aria-hidden="true"> · </span>
            <a href={`tel:${CONTACT_PHONE_E164}`} aria-label={`Call ${CONTACT_PHONE_DISPLAY}`}>
                Call
            </a>
        </>
    );
}

/** "Ask on WhatsApp" for one course or event, with its title prefilled into the chat. */
export function WhatsAppEnquiryLink({ about, className }: { about: string; className?: string }) {
    return (
        <WhatsAppLink about={about} label={`Ask on WhatsApp about ${about}`} className={className}>
            Ask on WhatsApp
        </WhatsAppLink>
    );
}
