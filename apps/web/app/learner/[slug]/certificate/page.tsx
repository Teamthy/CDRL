import type { Metadata } from 'next';
import SiteLayout from '../../../../components/SiteLayout';
import CertificateView from './CertificateView';

export const metadata: Metadata = {
    title: 'Certificate of completion',
    robots: { index: false, follow: false },
};

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <SiteLayout>
            <section className="auth-section">
                <div className="wrap learner-wrap">
                    <CertificateView slug={slug} />
                </div>
            </section>
        </SiteLayout>
    );
}
