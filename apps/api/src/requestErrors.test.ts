import express from 'express';
import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSON_BODY_LIMIT_BYTES, requestErrorHandler } from './requestErrors.js';

vi.mock('./logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { logger } from './logger.js';

/**
 * Audit: express.json was capped at 50 kb while validation allows a 60,000-character
 * course body, so a valid long body could fail at the parser with a generic error.
 * These run a real Express app with the same parser and error handler as index.ts.
 */
const app = express();
app.use(express.json({ limit: JSON_BODY_LIMIT_BYTES }));
app.post('/echo', (req, res) => res.json({ length: (req.body as { details: string }).details.length }));
app.post('/boom', () => {
    throw new Error('database unavailable');
});
app.use(requestErrorHandler);

let server: Server;
let base: string;

beforeAll(async () => {
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    const { port } = server.address() as { port: number };
    base = `http://127.0.0.1:${port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
    vi.clearAllMocks();
});

async function post(path: string, rawBody: string) {
    const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: rawBody,
    });
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

/** Prose shaped like a long course body: paragraphs, quotes, accented names and newlines. */
function courseBody(chars: number): string {
    const paragraph = 'He said "governance is practical." Ọlá’s team reviewed the ISO/IEC 27001 controls.\n';
    return paragraph.repeat(Math.ceil(chars / paragraph.length)).slice(0, chars);
}

describe('JSON body limit', () => {
    it('accepts a 60,000-character course body, which is larger than the old 50 kb limit', async () => {
        const details = courseBody(60_000);
        const json = JSON.stringify({ details });
        expect(Buffer.byteLength(json)).toBeGreaterThan(50 * 1024);
        expect(Buffer.byteLength(json)).toBeLessThan(JSON_BODY_LIMIT_BYTES);

        const res = await post('/echo', json);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ length: 60_000 });
    });

    it('answers an oversized body with a 413 that says why, not a 500', async () => {
        const res = await post('/echo', JSON.stringify({ details: 'x'.repeat(JSON_BODY_LIMIT_BYTES + 1024) }));
        expect(res.status).toBe(413);
        expect(res.body.message).toMatch(/too large \(the limit is 256 KB\)/);
        expect(logger.error).not.toHaveBeenCalled();
    });
});

describe('requestErrorHandler', () => {
    it('keeps malformed JSON a 400', async () => {
        const res = await post('/echo', '{"details": ');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Malformed JSON body' });
    });

    it('turns an unexpected error into a generic 500 and logs the detail', async () => {
        const res = await post('/boom', '{}');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: 'Internal server error' });
        expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ path: '/boom' }), 'unhandled request error');
    });
});
