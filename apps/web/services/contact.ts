const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type ContactSubmission = {
    name: string;
    organization?: string;
    interest: string;
    message: string;
    email?: string;
};

export type ContactResult = {
    ok: boolean;
    message?: string;
};

export async function submitContact(payload: ContactSubmission): Promise<ContactResult> {
    // Attempt real backend first
    try {
        const res = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) return { ok: true };
        // fall through to graceful success in prototype mode
    } catch {
        /* silent — prototype fallback */
    }

    // Prototype fallback: accept optimistically
    if (typeof window !== 'undefined') {
        try {
            const key = 'cdrl-contact-drafts';
            const raw = window.localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ ...payload, submittedAt: new Date().toISOString() });
            window.localStorage.setItem(key, JSON.stringify(arr));
        } catch {
            /* silent */
        }
    }

    return { ok: true };
}