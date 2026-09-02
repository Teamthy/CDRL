import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteLayout from '../../../components/SiteLayout';
import PayCallback from './PayCallback';

export const metadata: Metadata = {
    title: 'Payment status',
    robots: { index: false, follow: false },
};

export default function PayCallbackPage() {
    return (
        <SiteLayout>
            <section className="auth-section">
                <div className="wrap auth-wrap">
                    <Suspense fallback={null}>
                        <PayCallback />
                    </Suspense>
                </div>
            </section>
        </SiteLayout>
    );
}
