import type { ReactNode } from 'react';
import AnnouncementBar from './layout/AnnouncementBar';
import UtilityBar from './layout/UtilityBar';
import Header from './layout/Header';
import Footer from './layout/Footer';
import ServiceWorkerRegister from './ServiceWorkerRegister';
import { DEFAULT_FOOTER_CTA, hasPageContactCta, type FooterCta } from '../lib/pageCta';

type Props = {
    children: ReactNode;
    /** Optional initial cart/plan count for SSR hydration. */
    cartCount?: number;
    /**
     * Footer call-to-action. `'auto'` (default) keeps the generic
     * "Talk to our team" button only on pages that do not already carry their
     * own contact CTA, so no page shows both. Pass `false` to drop it, or a
     * `{ label, href }` object to override it.
     */
    footerCta?: FooterCta | 'auto';
};

export default function SiteLayout({ children, cartCount = 0, footerCta = 'auto' }: Props) {
    const cta = footerCta === 'auto' ? (hasPageContactCta(children) ? false : DEFAULT_FOOTER_CTA) : footerCta;
    return (
        <>
            <AnnouncementBar />
            <UtilityBar />
            <Header initialCount={cartCount} />
            <main id="main-content">{children}</main>
            <Footer cta={cta} />
            <ServiceWorkerRegister />
        </>
    );
}