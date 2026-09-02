import type { ReactNode } from 'react';
import AnnouncementBar from './layout/AnnouncementBar';
import UtilityBar from './layout/UtilityBar';
import Header from './layout/Header';
import Footer from './layout/Footer';

type Props = {
    children: ReactNode;
    /** Optional initial cart/plan count for SSR hydration. */
    cartCount?: number;
};

export default function SiteLayout({ children, cartCount = 0 }: Props) {
    return (
        <>
            <AnnouncementBar />
            <UtilityBar />
            <Header initialCount={cartCount} />
            <main id="main-content">{children}</main>
            <Footer />
        </>
    );
}