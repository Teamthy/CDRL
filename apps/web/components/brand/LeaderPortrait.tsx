'use client';

import { useState } from 'react';

type Props = {
    className?: string;
    alt?: string;
    src?: string;
};

/**
 * Renders the founder's portrait. Falls back to a branded placeholder
 * tile if the image asset is missing (e.g. during initial development).
 */
export default function LeaderPortrait({
    className = '',
    alt = 'Adeyinka Oladimeji, Founder and Lead Trainer',
    src = '/assets/ade-yinka-leadership.png',
}: Props) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className={`${className} portrait-placeholder`} role="img" aria-label={alt}>
                <div>
                    <strong style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Founder Portrait</strong>
                    Upload to /public/assets/ade-yinka-leadership.png
                </div>
            </div>
        );
    }

    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}