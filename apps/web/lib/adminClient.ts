'use client';

/**
 * Tiny client for the admin console. Token lives in localStorage
 * (12h JWT from /api/v1/admin/login); every call attaches it.
 * Any 401 clears the session and bounces to /admin/login.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const TOKEN_KEY = 'ykay_admin_token';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    window.localStorage.removeItem(TOKEN_KEY);
}

export async function adminLogin(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    try {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => null);
            return { ok: false, message: body?.message ?? `Login failed (${res.status})` };
        }
        const body = (await res.json()) as { token: string };
        setToken(body.token);
        return { ok: true };
    } catch {
        return { ok: false, message: 'Could not reach the API. Try again shortly.' };
    }
}

export class UnauthorizedError extends Error {}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (res.status === 401) {
        clearToken();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
            window.location.assign('/admin/login');
        }
        throw new UnauthorizedError('Session expired');
    }
    if (res.status === 204) return undefined as T;
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed (${res.status})`);
    }
    return (await res.json()) as T;
}

// ── Types mirroring the API ────────────────────────────────────────────────

export type EnquiryStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface Enquiry {
    id: string;
    name: string;
    email: string | null;
    organization: string | null;
    interest: string;
    message: string;
    status: EnquiryStatus;
    notes: string | null;
    createdAt: string;
}

export interface AdminOverview {
    enquiries: Record<string, number>;
    courses: number;
    upcomingEvents: number;
    publishedPosts: number;
}

export interface AdminCourse {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    track: string;
    level: string;
    deliveryMode: string;
    overview: string;
    priceKobo: number | null;
    currency: string;
    published: boolean;
    sortOrder: number;
    updatedAt: string;
}

export interface AdminEvent {
    id: string;
    slug: string;
    title: string;
    summary: string;
    body: string | null;
    location: string | null;
    startsAt: string;
    endsAt: string | null;
    registrationUrl: string | null;
    published: boolean;
}

export interface AdminPost {
    id: string;
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    body: string;
    coverImageUrl: string | null;
    published: boolean;
    publishedAt: string | null;
}

export interface ListResponse<T> {
    items: T[];
    total: number;
}
