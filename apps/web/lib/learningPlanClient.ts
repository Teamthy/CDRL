const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const LOCAL_STORAGE_KEY = 'cdrl-learning-plan';
const SESSION_COOKIE = 'cdrl_session';

export type LearningPlanItem = { courseId: string };
export type LearningPlan = { items: LearningPlanItem[] };
export type MutationResult = { ok: boolean };

function getOrCreateSessionId(): string {
    if (typeof document === 'undefined') return '';
    const name = `${SESSION_COOKIE}=`;
    const parts = document.cookie.split(';').map((p) => p.trim());
    for (const p of parts) {
        if (p.startsWith(name)) return p.slice(name.length);
    }
    const id =
        globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString();
    // Secure over HTTPS so the session cookie is never sent in cleartext.
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${SESSION_COOKIE}=${id}; Path=/; Expires=${expires}; SameSite=Lax${secure}`;
    return id;
}

function readLocalPlan(): LearningPlanItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter(
                  (item): item is LearningPlanItem =>
                      !!item && typeof (item as LearningPlanItem).courseId === 'string',
              )
            : [];
    } catch {
        return [];
    }
}

function writeLocalPlan(items: LearningPlanItem[]) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

async function fetchRemotePlan(sessionId: string): Promise<LearningPlan> {
    const res = await fetch(`${API_BASE}/learning-plan`, {
        headers: { 'x-session-id': sessionId },
    });
    if (!res.ok) return { items: [] };
    return (await res.json()) as LearningPlan;
}

export async function getLearningPlan(): Promise<LearningPlan> {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return { items: readLocalPlan() };
    try {
        return await fetchRemotePlan(sessionId);
    } catch {
        return { items: readLocalPlan() };
    }
}

export async function addLearningPlanItem(courseId: string): Promise<MutationResult> {
    const sessionId = getOrCreateSessionId();
    const existing = readLocalPlan();
    if (existing.some((item) => item.courseId === courseId)) {
        return { ok: true };
    }

    if (sessionId) {
        try {
            const res = await fetch(`${API_BASE}/learning-plan/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
                body: JSON.stringify({ courseId }),
            });
            if (res.ok) {
                writeLocalPlan([...existing, { courseId }]);
                return { ok: true };
            }
            if (res.status === 409) {
                writeLocalPlan([...existing, { courseId }]);
                return { ok: true };
            }
            return { ok: false };
        } catch {
            // API unreachable — persist locally so the selection isn't lost
        }
    }
    writeLocalPlan([...existing, { courseId }]);
    return { ok: true };
}

export async function removeLearningPlanItem(courseId: string): Promise<MutationResult> {
    const sessionId = getOrCreateSessionId();
    const remaining = readLocalPlan().filter((item) => item.courseId !== courseId);
    writeLocalPlan(remaining);

    if (!sessionId) return { ok: true };
    try {
        const res = await fetch(
            `${API_BASE}/learning-plan/items/${encodeURIComponent(courseId)}`,
            { method: 'DELETE', headers: { 'x-session-id': sessionId } },
        );
        return res.ok || res.status === 404 ? { ok: true } : { ok: false };
    } catch {
        // API unreachable — local copy already updated
        return { ok: true };
    }
}

export default {
    getLearningPlan,
    addLearningPlanItem,
    removeLearningPlanItem,
};
