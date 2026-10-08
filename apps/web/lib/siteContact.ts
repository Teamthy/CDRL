/**
 * The business's public contact details. This is the one place the phone
 * number, the WhatsApp chat link and the message prefilled into it are defined.
 *
 * Two number formats are in use and they are NOT interchangeable:
 *
 * - `CONTACT_PHONE_E164` is E.164: a `+` and digits only. Use it for `tel:`
 *   links and for schema.org `telephone`, which search engines read as a
 *   dialable number.
 * - `WHATSAPP_URL` is a wa.me link, which takes the number with no `+`, spaces
 *   or punctuation. `https://wa.me/2349025140519` works; `https://wa.me/+234 902 514 0519`
 *   does not.
 */
export const CONTACT_PHONE_E164 = '+2349025140519';
export const CONTACT_PHONE_DISPLAY = '+234 902 514 0519';
export const WHATSAPP_URL = 'https://wa.me/2349025140519';

/** Subject used in the prefilled greeting when a page has no specific one. */
const GENERIC_SUBJECT = 'YKAY Consult training';

/**
 * The opening message a visitor sends. The subject is the course or event they
 * were looking at; without one, the generic greeting is used.
 *
 * `enquiryMessage('ISO/IEC 27001 Lead Implementer')` returns
 * "Hello, I'd like to enquire about ISO/IEC 27001 Lead Implementer."
 */
export function enquiryMessage(subject?: string): string {
    const about = subject?.replace(/\s+/g, ' ').trim() || GENERIC_SUBJECT;
    return `Hello, I'd like to enquire about ${about}.`;
}

/** The chat link, with `message` URL-encoded into `?text=` when one is given. */
export function whatsappUrl(message?: string): string {
    return message ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}` : WHATSAPP_URL;
}
