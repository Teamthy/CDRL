import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import SiteLayout from '../../../components/SiteLayout';
import PageHero from '../../../components/sections/PageHero';
import CTASection from '../../../components/sections/CTASection';
import { getPostBySlug } from '../../../lib/data';
import JsonLd from '../../../components/JsonLd';
import { newsArticleJsonLd, SITE_URL } from '../../../lib/jsonld';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const URL_RE = /(https?:\/\/[^\s)]+)/g;

const RELATED_TRAINING: Record<string, { href: string; label: string }[]> = {
    'how-to-get-pecb-certification-in-nigeria': [
        { href: '/pecb-training-nigeria', label: 'PECB training in Nigeria — full portfolio' },
        { href: '/pecb-certification-nigeria', label: 'How PECB certification works' },
        { href: '/training-pricing', label: 'Training prices & registration' },
    ],
    'iso-27001-training-in-nigeria-foundation-lead-implementer-or-lead-auditor': [
        { href: '/training/iso-iec-27001-foundation', label: 'ISO/IEC 27001 Foundation' },
        { href: '/training/iso-iec-27001-lead-implementer', label: 'ISO/IEC 27001 Lead Implementer' },
        { href: '/training/iso-iec-27001-lead-auditor', label: 'ISO/IEC 27001 Lead Auditor' },
    ],
    'what-is-iso-42001-ai-governance-training-nigeria': [
        { href: '/training/iso-iec-42001-foundation', label: 'ISO/IEC 42001 Foundation' },
        { href: '/training/iso-iec-42001-lead-implementer', label: 'ISO/IEC 42001 Lead Implementer' },
        { href: '/training/iso-iec-42001-lead-auditor', label: 'ISO/IEC 42001 Lead Auditor' },
    ],
    'business-continuity-training-nigeria-iso-22301': [
        { href: '/training/iso-22301-foundation', label: 'ISO 22301 Foundation' },
        { href: '/training/iso-22301-lead-implementer', label: 'ISO 22301 Lead Implementer' },
        { href: '/training/iso-22301-lead-auditor', label: 'ISO 22301 Lead Auditor' },
    ],
    'cybersecurity-training-nigeria-choosing-a-certification-path': [
        { href: '/training/cybersecurity-management-foundation', label: 'Cybersecurity Management Foundation' },
        { href: '/training/cybersecurity-management-lead-cybersecurity-manager', label: 'Lead Cybersecurity Manager' },
        { href: '/pecb-training-nigeria', label: 'PECB training in Nigeria' },
    ],
};

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
                    {(RELATED_TRAINING[post.slug] ?? []).length > 0 && (
                        <div className="related-training">
                            <span className="kicker">RELATED TRAINING</span>
                            <ul>
                                {(RELATED_TRAINING[post.slug] ?? []).map((l) => (
                                    <li key={l.href}>
                                        <Link href={l.href as Route} className="text-link">
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <footer className="pr-links">
                        <Link href="/news">← All news</Link>
                    </footer>
                </div>
            </article>
            <CTASection />
        </SiteLayout>
    );
}
