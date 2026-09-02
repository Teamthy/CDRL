import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteLayout from '../../components/SiteLayout';
import SignInPanel from './SignInPanel';

export const metadata: Metadata = {
    title: 'Sign in — Learning Portal',
    description: 'Access your Ykay Consulting Hub learning account.',
    robots: { index: false, follow: false },
};

export default function SignInPage() {
    return (
        <SiteLayout>
            <section className="auth-section">
                <div className="wrap auth-wrap">
                    <Suspense fallback={null}>
                        <SignInPanel />
                    </Suspense>
                </div>
            </section>
        </SiteLayout>
    );
}
