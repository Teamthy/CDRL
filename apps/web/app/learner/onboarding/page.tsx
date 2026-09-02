import type { Metadata } from 'next';
import SiteLayout from '../../../components/SiteLayout';
import OnboardingFlow from './OnboardingFlow';

export const metadata: Metadata = {
    title: 'Welcome to your learning portal',
    robots: { index: false, follow: false },
};

export default function OnboardingPage() {
    return (
        <SiteLayout>
            <section className="auth-section">
                <div className="wrap learner-wrap">
                    <OnboardingFlow />
                </div>
            </section>
        </SiteLayout>
    );
}
