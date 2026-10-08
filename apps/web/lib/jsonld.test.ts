import { describe, expect, it } from 'vitest';
import { organizationJsonLd } from './jsonld';
import { CONTACT_PHONE_E164 } from './siteContact';

describe('organizationJsonLd contact point', () => {
    it('publishes the dialable E.164 number as telephone', () => {
        const point = organizationJsonLd().contactPoint[0];
        expect(point.telephone).toBe(CONTACT_PHONE_E164);
    });

    it('never puts a wa.me link in a telephone field', () => {
        // Search engines read `telephone` as a number; a chat URL makes the
        // structured data invalid. WhatsApp belongs in a sameAs or a second point.
        const telephones = organizationJsonLd().contactPoint.map((point) => point.telephone);
        expect(telephones.some((value) => value.includes('wa.me'))).toBe(false);
    });
});
