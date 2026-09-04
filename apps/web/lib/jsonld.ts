import type { Course } from './contracts';

/**
 * schema.org JSON-LD builders for rich results (Organization, WebSite,
 * Course, NewsArticle). Kept dependency-free; every builder takes plain
 * data so pages can call them inline.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const ORG_NAME = 'Ykay Consulting Hub';
const ORG_ALT_NAMES = ['YKAY Consult', 'Centre for Digital Risk & Leadership'];
const ORG_EMAIL = 'info@ykayconsultinghub.com.ng';
const ORG_PHONE = '+2348060533847';

export function organizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: ORG_NAME,
        alternateName: ORG_ALT_NAMES,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        description:
            'Professional training and certification in cybersecurity, governance, risk, AI governance and digital leadership — an Authorized Partner of PECB delivering ISO-standard certification courses in Nigeria.',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Lagos',
            addressCountry: 'NG',
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: ORG_EMAIL,
                telephone: ORG_PHONE,
                areaServed: 'NG',
                availableLanguage: ['en'],
            },
        ],
    };
}

export function websiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'YKAY Consult',
        url: SITE_URL,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
    };
}

/** Course rich-result data for a /training/[slug] page. */
export function courseJsonLd(course: Course) {
    const isPecb = course.subtitle.includes('PECB');
    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: `${course.title} ${course.subtitle}`,
        description: isPecb
            ? `${course.overview} Official PECB certification course delivered in Nigeria by Ykay Consulting Hub, an Authorized Partner of PECB.`
            : course.overview,
        url: `${SITE_URL}/training/${course.slug}`,
        inLanguage: 'en',
        educationalLevel: course.level,
        teaches: course.overview,
        provider: {
            '@type': 'EducationalOrganization',
            name: ORG_NAME,
            url: SITE_URL,
        },
    };
    if (typeof course.priceKobo === 'number' && course.priceKobo > 0) {
        data.offers = {
            '@type': 'Offer',
            price: (course.priceKobo / 100).toFixed(2).replace(/\.00$/, ''),
            priceCurrency: course.currency || 'NGN',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/training/${course.slug}`,
        };
    }
    return data;
}

/** NewsArticle rich-result data for /news/[slug] pages. */
export function newsArticleJsonLd(opts: {
    headline: string;
    description: string;
    datePublished: string;
    dateModified?: string;
    url: string;
    image?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: opts.headline,
        description: opts.description,
        datePublished: opts.datePublished,
        dateModified: opts.dateModified ?? opts.datePublished,
        url: opts.url,
        mainEntityOfPage: opts.url,
        inLanguage: 'en',
        ...(opts.image ? { image: [opts.image] } : {}),
        author: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
        publisher: {
            '@type': 'Organization',
            name: ORG_NAME,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
        },
    };
}
