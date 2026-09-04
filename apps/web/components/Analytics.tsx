import Script from 'next/script';

/**
 * GA4 analytics — activates only when NEXT_PUBLIC_GA_ID is set in the
 * environment, so local dev and preview builds stay script-free.
 * Create the ID free at analytics.google.com (see seo-kit instructions).
 */
export default function Analytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return null;
    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}');
                `}
            </Script>
        </>
    );
}
