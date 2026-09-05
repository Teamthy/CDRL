import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import { fetchTrainers } from '../../lib/api';

export const revalidate = 1800;

export const metadata = {
    title: 'Our Trainers',
    description: 'PECB-certified instructors and industry practitioners delivering CDRL programmes.',
    alternates: { canonical: '/trainers' },
};

export default async function TrainersPage() {
    const trainers = await fetchTrainers();
    return (
        <SiteLayout>
            <PageHero
                eyebrow="FACULTY"
                title="Learn from certified practitioners."
                description="Every CDRL programme is delivered by an instructor who has both the certification and the field experience."
            />
            <section className="trainer-index">
                <div className="wrap">
                    {!trainers || trainers.length === 0 ? (
                        <div className="empty-state">
                            <GraduationCap aria-hidden="true" />
                            <p>Trainer profiles publish soon. In the meantime, contact us about any specific instructor.</p>
                        </div>
                    ) : (
                        <div className="trainer-grid">
                            {trainers.map((t) => (
                                <Link key={t.id} href={`/trainers/${t.slug}` as Route} className="trainer-card">
                                    <div className="trainer-photo" aria-hidden="true">
                                        {t.photoUrl ? (
                                            <Image src={t.photoUrl} alt="" width={320} height={380} style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <span className="trainer-initials">
                                                {t.name
                                                    .split(' ')
                                                    .map((p) => p[0])
                                                    .slice(0, 2)
                                                    .join('')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="trainer-card-body">
                                        <strong>{t.name}</strong>
                                        <span>{t.title}</span>
                                        <small>{t.focus}</small>
                                        <span className="trainer-go">
                                            View profile <ArrowRight aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <section className="cross-band">
                <div className="wrap">
                    <p>
                        Our faculty delivers official PECB certification courses —{' '}
                        <Link href="/pecb-training-nigeria" className="text-link">
                            see the PECB portfolio
                        </Link>{' '}
                        or{' '}
                        <Link href="/pecb-certification-nigeria" className="text-link">
                            how PECB certification works
                        </Link>
                        .
                    </p>
                </div>
            </section>
        </SiteLayout>
    );
}
