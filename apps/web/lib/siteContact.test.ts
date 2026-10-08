import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164, WHATSAPP_URL, enquiryMessage, whatsappUrl } from './siteContact';

describe('site contact details', () => {
    it('WHATSAPP_URL is the E.164 number with no +, spaces or punctuation', () => {
        // wa.me rejects anything but the bare international digits.
        expect(WHATSAPP_URL).toBe(`https://wa.me/${CONTACT_PHONE_E164.replace(/^\+/, '')}`);
        expect(WHATSAPP_URL.replace('https://wa.me/', '')).toMatch(/^\d+$/);
    });

    it('the display number carries the same digits as the dialable one', () => {
        expect(CONTACT_PHONE_DISPLAY.replace(/\D/g, '')).toBe(CONTACT_PHONE_E164.replace(/\D/g, ''));
    });

    it('is a Nigerian mobile in E.164 format', () => {
        expect(CONTACT_PHONE_E164).toMatch(/^\+234\d{10}$/);
    });

    it('whatsappUrl adds the message URL-encoded, or nothing at all', () => {
        expect(whatsappUrl()).toBe(WHATSAPP_URL);
        expect(new URL(whatsappUrl('Hi, ISO & 27001?')).searchParams.get('text')).toBe('Hi, ISO & 27001?');
    });

    it('enquiryMessage names the subject and falls back to the generic greeting', () => {
        expect(enquiryMessage('ISO/IEC 27001 Lead Implementer')).toBe(
            "Hello, I'd like to enquire about ISO/IEC 27001 Lead Implementer.",
        );
        expect(enquiryMessage('   ')).toBe(enquiryMessage());
        expect(enquiryMessage()).toBe("Hello, I'd like to enquire about YKAY Consult training.");
    });
});

/** Non-test .ts/.tsx files under `dir`. */
function sourceFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : sourceFiles(path);
        return /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path] : [];
    });
}

describe('the phone number has one source', () => {
    it('neither the retired number nor the new digits are hardcoded outside lib/siteContact.ts', () => {
        // Guards the drift this module exists to prevent: the number used to be
        // typed into three files by hand.
        const webRoot = fileURLToPath(new URL('..', import.meta.url));
        const files = ['app', 'components', 'lib', 'services'].flatMap((dir) => sourceFiles(join(webRoot, dir)));
        const offenders = files.filter(
            (file) => !file.endsWith(join('lib', 'siteContact.ts')) && /8060533847|9025140519/.test(readFileSync(file, 'utf8')),
        );
        expect(offenders).toEqual([]);
    });
});
