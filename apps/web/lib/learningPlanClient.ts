const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const LOCAL_STORAGE_KEY = 'cdrl-learning-plan';

function getOrCreateSessionId() {
    if (typeof document === 'undefined') return '';
    const name = 'cdrl_session=';
    const parts = document.cookie.split(';').map((p) => p.trim());
    for (const p of parts) {
        if (p.startsWith(name)) return p.slice(name.length);
    }
    const id = (globalThis.crypto && (globalThis.crypto as any).randomUUID) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString();
    document.cookie = `cdrl_session=${id}; path=/; Expires=${expires}; SameSite=Lax`;
    return id;
}

function readLocalPlan() {
    if (typeof window === 'undefined') return [] as Array<{ courseId: string }>;
    try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((item: any) => item && typeof item.courseId === 'string') : [];
    } catch {
        return [];
    }
}

function writeLocalPlan(items: Array<{ courseId: string }>) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

async function fetchPlan(sessionId: string) {
    const res = await fetch(`${API_BASE}/learning-plan`, { headers: { 'x-session-id': sessionId } });
    if (!res.ok) return { items: [] };
    return res.json();
}

export async function getLearningPlan() {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return { items: readLocalPlan().map((item) => ({ courseId: item.courseId })) };
    try {
        const remote = await fetchPlan(sessionId);
        return remote;
    } catch {
        return { items: readLocalPlan().map((item) => ({ courseId: item.courseId })) };
    }
}

export async function addLearningPlanItem(courseId: string) {
    const sessionId = getOrCreateSessionId();
    const existing = readLocalPlan();
    if (existing.some((item) => item.courseId === courseId)) {
        writeLocalPlan(existing);
        return { ok: true };
    }

    try {
        const res = await fetch(`${API_BASE}/learning-plan/items`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId }, body: JSON.stringify({ courseId }) });
        if (res.ok) {
            writeLocalPlan([...existing, { courseId }]);
            return res;
        }
    } catch {
        // fall back to local storage when the API is unavailable
    }

    writeLocalPlan([...existing, { courseId }]);
    return { ok: true };
}

export async function removeLearningPlanItem(courseId: string) {
    const sessionId = getOrCreateSessionId();
    const existing = readLocalPlan().filter((item) => item.courseId !== courseId);
    writeLocalPlan(existing);

    try {
        const res = await fetch(`${API_BASE}/learning-plan/items/${encodeURIComponent(courseId)}`, { method: 'DELETE', headers: { 'x-session-id': sessionId } });
        return res;
    } catch {
        return { ok: true };
    }
}

export default {
    getLearningPlan,
    addLearningPlanItem,
    removeLearningPlanItem,
};
