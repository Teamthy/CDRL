type Props = {
    /** When true, forces black text (use only against non-black backgrounds). */
    dark?: boolean;
    /** Show or hide the small descriptor line. */
    showDescriptor?: boolean;
    /** Override the mark size (px). Default 42. */
    size?: number;
};

/**
 * YKAY Consult brand lockup: SVG mark (identical to favicon) + wordmark.
 * The SVG is inlined so it inherits sizing and never needs a network round-trip.
 */
export default function Logo({ dark = false, showDescriptor = true, size = 42 }: Props) {
    return (
        <span
            className={`brand ${dark ? 'dark' : ''}`}
            aria-label="YKAY Consult, Centre for Digital Risk and Leadership"
        >
            <span
                className="brand-mark-svg"
                aria-hidden="true"
                style={{ width: size, height: size }}
            >
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="14" fill="#000000" />
                    <path
                        d="M49 17a22 22 0 1 0 0 30V36a13 13 0 1 1 0-8z"
                        fill="#70F250"
                    />
                    <circle cx="47" cy="32" r="5" fill="#FFF7E4" />
                </svg>
            </span>
            <span className="brand-title">
                <strong>YKAY CONSULT</strong>
                {showDescriptor && <small>Centre for Digital Risk &amp; Leadership</small>}
            </span>
        </span>
    );
}