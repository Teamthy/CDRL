/**
 * Renders a schema.org JSON-LD block. Server-component only — used for
 * structured data (Organization, WebSite, Course, NewsArticle) that Google
 * reads for rich results.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}
