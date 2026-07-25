'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
    className?: string;
    alt?: string;
    src?: string;
};

/**
 * Renders the founder's portrait via next/image (responsive, lazy, optimized)
 * with a branded placeholder tile if the asset is missing at runtime.
 */
export default function LeaderPortrait({
    className = '',
    alt = 'Adeyinka Oladimeji, Founder and Lead Trainer',
    src = '/assets/founder-portrait.jpg',
}: Props) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className={`${className} portrait-placeholder`} role="img" aria-label={alt}>
                <div>
                    <strong style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Founder Portrait</strong>
                    Asset unavailable
                </div>
            </div>
        );
    }

    return (
        <Image
            className={className}
            src={src}
            alt={alt}
            width={900}
            height={1500}
            sizes="(max-width: 900px) 100vw, 40vw"
            onError={() => setFailed(true)}
        />
    );
}
