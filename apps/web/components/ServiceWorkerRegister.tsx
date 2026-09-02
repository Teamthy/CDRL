'use client';

import { useEffect } from 'react';

/** Registers /sw.js in production browsers that support it. Silent no-op elsewhere. */
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }, []);
    return null;
}
