import SiteLayout from '../../components/SiteLayout';
import PageHero from '../../components/sections/PageHero';
import CTASection from '../../components/sections/CTASection';
import Reveal from '../../components/motion/Reveal';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPublishedPosts } from '../../lib/data';

export const revalidate = 1800;

export const metadata = {
    title: 'News & Updates',
    description:
        'Announcements from Ykay Consulting Hub — partnerships, programmes, and milestones in professional training and certification across Africa.',
    alternates: { canonical: '/news' },
};

const posts = [
    {
        date: '06 August 2026',
        category: 'PARTNERSHIP ANNOUNCEMENT',
        title: 'PECB Signs a Partnership Agreement with Ykay Consulting Hub',
        excerpt:
            'PECB, an ISO certification and training company, announced a partnership agreement with Ykay Consulting Hub to deliver best practices of ISO standards in Nigeria — spanning information security, cybersecurity, AI management, business continuity, and ISO management systems.',
        href: '/pecb-signs-partnership-agreement-with-ykay-consulting-hub',
    },
] as const;

export default async function NewsPage() {
    const dbPosts = await getPublishedPosts();
    return (
        <SiteLayout>
            <PageHero
                eyebrow="NEWS & UPDATES"
                title="News from Ykay Consulting Hub"
                description="Partnerships, programmes and milestones as we expand internationally recognized training and certification across Africa."
            />
            {dbPosts.length > 0 && (
                <section className="news-list news-list-db">
                    <div className="wrap">
                        {dbPosts.map((post) => (
                            <Reveal key={post.id}>
                                <article className="news-card">
                                    <span className="news-meta">
                                        {post.category.toUpperCase()} ·{' '}
                                        <time dateTime={post.publishedAt ?? post.createdAt}>
                                            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('en-NG', {
                                                dateStyle: 'long',
                                            })}
                                        </time>
                                    </span>
                                    <h2>{post.title}</h2>
                                    <p>{post.excerpt}</p>
                                    <Link href={`/news/${post.slug}` as Route} className="text-link">
                                        <span>Read article</span>
                                        <ArrowRight />
                                    </Link>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </section>
            )}
            <section className="news-list">
                <div className="wrap">
                    {posts.map((post) => (
                        <Reveal key={post.href}>
                            <article className="news-card">
                                <span className="news-meta">
                                    {post.category} · <time dateTime="2026-08-06">{post.date}</time>
                                </span>
                                <h2>{post.title}</h2>
                                <p>{post.excerpt}</p>
                                <Link href={post.href} className="text-link">
                                    <span>Read the press release</span>
                                    <ArrowRight />
                                </Link>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </section>
            <CTASection />
        </SiteLayout>
    );
}
