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

const URL_RE = /(https?:\/\/[^\s)]+)/g;

/** Plain-text paragraph renderer that turns bare URLs into links
 *  (internal links stay same-tab; external open safely in a new tab). */
function ParagraphWithLinks({ text }: { text: string }) {
    return (
        <p>
            {text.split(URL_RE).map((part, i) => {
                if (i % 2 === 0) return part;
                const isInternal = part.includes('ykayconsultinghub.com.ng');
                return (
                    <a
                        key={i}
                        href={part}
                        {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                        {part}
                    </a>
                );
            })}
        </p>
    );
}

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
    // Normalize CRLF/CR so Windows-authored bodies split into paragraphs correctly.
    const paragraphs = post.body
        .replace(/\r\n?/g, '\n')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

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
                        <ParagraphWithLinks key={i} text={p} />
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
