import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteLayout from '../../../components/SiteLayout';
import PageHero from '../../../components/sections/PageHero';
import CTASection from '../../../components/sections/CTASection';
import { getPostBySlug } from '../../../lib/data';
import JsonLd from '../../../components/JsonLd';
import { newsArticleJsonLd, SITE_URL } from '../../../lib/jsonld';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: 'Article not found' };
    return {
        title: post.title,
        description: post.excerpt,
        alternates: { canonical: `/news/${post.slug}` },
    };
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const dateIso = post.publishedAt ?? post.createdAt;
    const dateLabel = new Date(dateIso).toLocaleDateString('en-NG', { dateStyle: 'long' });
    const paragraphs = post.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

    return (
        <SiteLayout>
            <JsonLd
                data={newsArticleJsonLd({
                    headline: post.title,
                    description: post.excerpt,
                    datePublished: dateIso,
                    url: `${SITE_URL}/news/${post.slug}`,
                })}
            />
            <PageHero eyebrow={post.category.toUpperCase()} title={post.title} description={`${dateLabel} · Ykay Consulting Hub`} />
            <article className="pr-article">
                <div className="wrap">
                    {paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                    <footer className="pr-links">
                        <Link href="/news">← All news</Link>
                    </footer>
                </div>
            </article>
            <CTASection />
        </SiteLayout>
    );
}
