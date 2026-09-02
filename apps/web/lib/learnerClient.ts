'use client';

/**
 * Learner session client (LMS Phase 2) — mirrors adminClient.
 * 12h JWT from /api/v1/learner/login|signup lives in localStorage;
 * 401s clear the session so pages can bounce to /sign-in.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const TOKEN_KEY = 'ykh_learner_token';

export interface LearnerUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface LearnerEnrollment {
    id: string;
    status: 'active' | 'completed' | 'paused';
    progress: number;
    course: { title: string; slug: string; track: string };
    tutor: string | null;
    updatedAt?: string;
}

export interface LearnerMe {
    user: LearnerUser;
    enrollments: LearnerEnrollment[];
}

export class LearnerUnauthorizedError extends Error {
    constructor() {
        super('Not signed in');
    }
}

export function getLearnerToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
}

export function setLearnerToken(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearLearnerToken() {
    window.localStorage.removeItem(TOKEN_KEY);
}

interface PostResult {
    ok: boolean;
    message?: string;
}

async function post(path: string, body: unknown): Promise<PostResult & { token?: string; user?: LearnerUser }> {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        if (!res.ok) {
            const msg = typeof payload?.message === 'string' ? payload.message : `Something went wrong (${res.status})`;
            return { ok: false, message: msg };
        }
        return {
            ok: true,
            message: typeof payload?.message === 'string' ? payload.message : undefined,
            token: typeof payload?.token === 'string' ? payload.token : undefined,
            user: (payload?.user as LearnerUser | undefined) ?? undefined,
        };
    } catch {
        return { ok: false, message: 'Could not reach the API. Try again shortly.' };
    }
}

export async function learnerSignIn(email: string, password: string): Promise<PostResult> {
    const r = await post('/learner/login', { email, password });
    if (r.ok && r.token) setLearnerToken(r.token);
    return r;
}

export async function learnerSignUp(name: string, email: string, password: string): Promise<PostResult> {
    const r = await post('/learner/signup', { name, email, password });
    if (r.ok && r.token) setLearnerToken(r.token);
    return r;
}

export async function learnerForgotPassword(email: string): Promise<PostResult> {
    return post('/learner/forgot-password', { email });
}

export async function learnerResetPassword(token: string, password: string): Promise<PostResult> {
    return post('/learner/reset-password', { token, password });
}

export async function learnerMe(): Promise<LearnerMe> {
    const token = getLearnerToken();
    if (!token) throw new LearnerUnauthorizedError();
    const res = await fetch(`${API_BASE}/learner/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) {
        clearLearnerToken();
        throw new LearnerUnauthorizedError();
    }
    if (!res.ok) throw new Error(`Failed to load your account (${res.status})`);
    return (await res.json()) as LearnerMe;
}

export interface LearnerModule {
    id: string;
    title: string;
    order: number;
    body: string | null;
}

export interface LearnerCourseView {
    course: { title: string; slug: string; track: string };
    enrollment: { id: string; status: string; progress: number };
    modules: LearnerModule[];
}

export class NotEnrolledError extends Error {
    constructor() {
        super('Not enrolled');
    }
}

/** Published modules for a course the learner is enrolled in. */
export async function learnerCourseModules(slug: string): Promise<LearnerCourseView> {
    const token = getLearnerToken();
    if (!token) throw new LearnerUnauthorizedError();
    const res = await fetch(`${API_BASE}/learner/courses/${encodeURIComponent(slug)}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        clearLearnerToken();
        throw new LearnerUnauthorizedError();
    }
    if (res.status === 403) throw new NotEnrolledError();
    if (res.status === 404) throw new Error('Course not found');
    if (!res.ok) throw new Error(`Failed to load modules (${res.status})`);
    return (await res.json()) as LearnerCourseView;
}
