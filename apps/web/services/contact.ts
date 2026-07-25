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

/**
 * Submits a contact enquiry and tells the truth about the outcome.
 * The old implementation silently stored the message in localStorage and
 * returned success when the API failed — losing real customer enquiries
 * while telling users "our team will respond shortly". That is gone.
 */
export async function submitContact(payload: ContactSubmission): Promise<ContactResult> {
    let res: Response;
    try {
        res = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch {
        return {
            ok: false,
            message: 'Unable to reach the server. Please check your connection and try again.',
        };
    }

    if (res.ok) return { ok: true };

    if (res.status === 429) {
        return { ok: false, message: 'Too many attempts. Please wait a minute and try again.' };
    }
    return { ok: false, message: 'Something went wrong. Please try again.' };
}
