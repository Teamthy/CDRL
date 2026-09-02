import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, GraduationCap } from 'lucide-react';
import SiteLayout from '../../../components/SiteLayout';
import { fetchTrainer, fetchTrainers } from '../../../lib/api';

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    const trainers = await fetchTrainers().catch(() => null);
    return (trainers ?? []).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const trainer = await fetchTrainer(slug);
    if (!trainer) return { title: 'Trainer not found' };
    return {
        title: `${trainer.name} — ${trainer.title}`,
        description: trainer.bio.slice(0, 160),
        alternates: { canonical: `/trainers/${trainer.slug}` },
    };
}

export default async function TrainerPage({ params }: Props) {
    const { slug } = await params;
    const trainer = await fetchTrainer(slug);
    if (!trainer) notFound();

    const taught = trainer.courses ?? [];

    return (
        <SiteLayout>
            <section className="trainer-hero">
                <div className="wrap trainer-hero-grid">
                    <div className="trainer-photo-lg" aria-hidden="true">
                        {trainer.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={trainer.photoUrl} alt="" />
                        ) : (
                            <span>
                                {trainer.name
                                    .split(' ')
                                    .map((p) => p[0])
                                    .slice(0, 2)
                                    .join('')}
                            </span>
                        )}
                    </div>
                    <div>
                        <Link href="/trainers" className="back">
                            <ArrowLeft aria-hidden="true" /> All trainers
                        </Link>
                        <span className="kicker">INSTRUCTOR</span>
                        <h1>{trainer.name}</h1>
                        <p className="trainer-title-lg">{trainer.title}</p>
                        <p className="trainer-bio">{trainer.bio}</p>
                        <p className="trainer-focus">
                            <GraduationCap aria-hidden="true" /> Focus areas: {trainer.focus}
                        </p>
                        {trainer.linkedIn && (
                            <a className="text-link" href={trainer.linkedIn} target="_blank" rel="noopener noreferrer">
                                <span>LinkedIn profile</span>
                                <ExternalLink aria-hidden="true" width={14} />
                            </a>
                        )}
                    </div>
                </div>
            </section>
            <section className="trainer-courses">
                <div className="wrap">
                    <h2>Courses taught by {trainer.name.split(' ')[0]}</h2>
                    {taught.length === 0 ? (
                        <p className="admin-sub">No active course assignments yet.</p>
                    ) : (
                        <div className="trainer-courses-grid">
                            {taught.map((ct) => (
                                <Link key={ct.course.slug} href={`/training/${ct.course.slug}` as Route} className="trainer-course-card">
                                    <span className="kicker">{ct.course.track}</span>
                                    <strong>{ct.course.title}</strong>
                                    <em>{ct.course.subtitle}</em>
                                    {ct.role && <small>{ct.role}</small>}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}
