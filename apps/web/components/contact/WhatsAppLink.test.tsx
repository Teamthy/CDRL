import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ContactInfo from '../sections/ContactInfo';
import Footer from '../layout/Footer';
import { PhoneContactLinks, WhatsAppEnquiryLink } from './WhatsAppLink';

/** Every <a> in rendered HTML as its decoded attributes, in document order. */
function anchors(html: string): Record<string, string>[] {
    const decode = (value: string) =>
        value.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return [...html.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) =>
        Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, decode(value)])),
    );
}

const WHATSAPP_LABEL = 'Chat on WhatsApp: +234 902 514 0519 (opens WhatsApp in a new tab)';

describe('WhatsApp contact links', () => {
    it('opens the number in a WhatsApp chat, in a new tab, and says so to screen readers', () => {
        const link = anchors(renderToStaticMarkup(<PhoneContactLinks />)).find((a) => a.href?.startsWith('https://wa.me/'));
        expect(link).toBeDefined();
        expect(link!.href).toMatch(/^https:\/\/wa\.me\/2349025140519\?text=/);
        expect(link!.target).toBe('_blank');
        expect(link!.rel).toBe('noopener noreferrer');
        expect(link!['aria-label']).toBe(WHATSAPP_LABEL);
    });

    it('keeps a call link beside the chat link', () => {
        const call = anchors(renderToStaticMarkup(<PhoneContactLinks />)).find((a) => a.href?.startsWith('tel:'));
        expect(call?.href).toBe('tel:+2349025140519');
        expect(call?.['aria-label']).toBe('Call +234 902 514 0519');
    });

    it('prefills the course or event a visitor is looking at', () => {
        const [link] = anchors(renderToStaticMarkup(<WhatsAppEnquiryLink about="ISO/IEC 27001 Lead Implementer" />));
        expect(new URL(link.href).searchParams.get('text')).toBe(
            "Hello, I'd like to enquire about ISO/IEC 27001 Lead Implementer.",
        );
        expect(link['aria-label']).toBe(
            'Ask on WhatsApp about ISO/IEC 27001 Lead Implementer (opens WhatsApp in a new tab)',
        );
    });

    it('the contact page and the footer both show the new number and never the retired one', () => {
        for (const html of [renderToStaticMarkup(<ContactInfo />), renderToStaticMarkup(<Footer />)]) {
            expect(html).toContain('+234 902 514 0519');
            expect(html).toContain('href="tel:+2349025140519"');
            expect(html).not.toMatch(/8060533847|806 053 3847/);
            expect(anchors(html).some((a) => a['aria-label'] === WHATSAPP_LABEL)).toBe(true);
        }
    });
});
