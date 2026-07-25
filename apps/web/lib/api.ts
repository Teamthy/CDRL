const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function getCourses(search?: string, track?: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (track) params.set('track', track);
    const url = `${API_BASE}/courses${params.toString() ? `?${params.toString()}` : ''}`;
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
    } catch (e) {
        // Fallback to local content during builds or when API is unavailable
        try {
            // eslint-disable-next-line @typescript-eslint/consistent-type-imports
            const mod = await import('./content');
            return mod.courses;
        } catch (e2) {
            return [];
        }
    }
}

export async function getCourse(slug: string) {
    try {
        const res = await fetch(`${API_BASE}/courses/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        try {
            const mod = await import('./content');
            return mod.courses.find((c: any) => c.slug === slug) ?? null;
        } catch (e2) {
            return null;
        }
    }
}

export async function getContent(page: string) {
    try {
        const res = await fetch(`${API_BASE}/content/${encodeURIComponent(page)}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        try {
            const mod = await import('./content');
            return mod.pageData[page] ?? null;
        } catch (e2) {
            return null;
        }
    }
}

export default API_BASE;
