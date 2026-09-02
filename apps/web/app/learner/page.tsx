import type { Metadata } from 'next';
import SiteLayout from '../../components/SiteLayout';
import LearnerDashboard from './LearnerDashboard';

export const metadata: Metadata = {
    title: 'My Learning',
    robots: { index: false, follow: false },
};

export default function LearnerPage() {
    return (
        <SiteLayout>
            <section className="auth-section">
                <div className="wrap learner-wrap">
                    <LearnerDashboard />
                </div>
            </section>
        </SiteLayout>
    );
}
