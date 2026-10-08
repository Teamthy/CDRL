import type { NextFunction, Request, Response } from 'express';
import { logger } from './logger.js';

/**
 * Largest JSON request body the API accepts, in bytes.
 *
 * Validation counts characters: a course body may be up to 60,000 (validation.ts).
 * The body parser counts bytes. JSON escapes quotes, backslashes and newlines to
 * two bytes, and UTF-8 takes two or three bytes for accented letters, so an
 * ordinary long course body can exceed 50 kb. The old 50 kb limit rejected such a
 * body before validation could run, with an unhelpful error. 256 kb holds a
 * 60,000-character body full of escapes with room to spare.
 */
export const JSON_BODY_LIMIT_BYTES = 256 * 1024;
export const JSON_BODY_LIMIT_LABEL = '256 KB';

/** Parse errors become a 400 or 413 with a reason. Anything else is logged and becomes a 500. Mount last. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function requestErrorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Malformed JSON body' });
    }
    if (isPayloadTooLarge(err)) {
        return res.status(413).json({
            message: `Request body is too large (the limit is ${JSON_BODY_LIMIT_LABEL}). Shorten the text and try again.`,
        });
    }
    logger.error({ err, method: req.method, path: req.originalUrl }, 'unhandled request error');
    return res.status(500).json({ message: 'Internal server error' });
}

/** body-parser signals an oversized body with type `entity.too.large` and status 413. */
function isPayloadTooLarge(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as { type?: unknown }).type === 'entity.too.large';
}
