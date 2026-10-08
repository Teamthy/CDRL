import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitCorporateQuote, submitWaitlist } from './enquiries';

// Field limits from apps/api/src/validation.ts (contactSchema).
const LIMITS = { name: 120, organization: 160, interest: 80, message: 5000, email: 254 } as const;

const course = {
    title: 'ISO/IEC 27001 Lead Implementer',
    subtitle: 'Five-day certification course',
    slug: 'iso-iec-27001-lead-implementer',
};

type Captured = { url: string; body: Record<string, unknown> };

function stubFetch(status: number): Captured[] {
    const calls: Captured[] = [];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
        calls.push({ url, body: JSON.parse(String(init.body)) });
        return new Response(null, { status });
    });
    return calls;
}

function expectWithinLimits(body: Record<string, unknown>) {
    for (const [field, max] of Object.entries(LIMITS)) {
        const value = body[field];
        if (typeof value === 'string') expect(value.length, field).toBeLessThanOrEqual(max);
    }
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('waitlist submission', () => {
    it('posts to the contact endpoint, not /enquiries', async () => {
        const calls = stubFetch(201);
        const result = await submitWaitlist(course, '  ada@example.com ');
        expect(result).toEqual({ ok: true });
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toMatch(/\/contact$/);
        expect(calls[0].url).not.toMatch(/enquiries/);
    });

    it('sends a payload the contact schema accepts, with the course in the message', async () => {
        const calls = stubFetch(201);
        await submitWaitlist(course, '  ada@example.com ');
        expect(calls[0].body).toEqual({
            name: 'Waitlist subscriber',
            email: 'ada@example.com',
            interest: 'Professional Training',
            message: 'WAITLIST: ISO/IEC 27001 Lead Implementer Five-day certification course (iso-iec-27001-lead-implementer)',
        });
        expectWithinLimits(calls[0].body);
    });

    it('reports a server failure as a failure', async () => {
        stubFetch(500);
        const result = await submitWaitlist(course, 'ada@example.com');
        expect(result.ok).toBe(false);
    });
});

describe('corporate quote submission', () => {
    const request = {
        name: '  Ada Obi ',
        organization: ' Acme Ltd ',
        email: ' ada@acme.example ',
        teamSize: '6–15 people',
        focus: '  ISO 27001 readiness for our data team  ',
    };

    it('posts to the contact endpoint, with the organisation in its own field', async () => {
        const calls = stubFetch(201);
        const result = await submitCorporateQuote(request);
        expect(result).toEqual({ ok: true });
        expect(calls[0].url).toMatch(/\/contact$/);
        expect(calls[0].body).toEqual({
            name: 'Ada Obi',
            organization: 'Acme Ltd',
            email: 'ada@acme.example',
            interest: 'Corporate Training',
            message: 'Team size: 6–15 people. Training focus: ISO 27001 readiness for our data team',
        });
        expectWithinLimits(calls[0].body);
    });

    it('reports a server failure as a failure', async () => {
        stubFetch(500);
        const result = await submitCorporateQuote(request);
        expect(result.ok).toBe(false);
    });
});

/** Source files under a directory, skipping tests (which mention the path on purpose). */
function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return sourceFiles(path);
        return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
    });
}

describe('no form posts to the retired public endpoint', () => {
    it('keeps the public /enquiries path out of components and lib', () => {
        const here = fileURLToPath(new URL('.', import.meta.url));
        const files = [...sourceFiles(join(here, '..', 'components')), ...sourceFiles(here)];
        const offenders = files.filter((file) =>
            /api\/v1\/enquiries|\$\{API_BASE\}\/enquiries\b/.test(readFileSync(file, 'utf8')),
        );
        expect(offenders).toEqual([]);
    });
});
