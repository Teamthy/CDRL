import pino from 'pino';
import { config } from './config.js';

/**
 * Structured JSON logger. Level comes from LOG_LEVEL env (now actually used).
 * In production, logs are single-line JSON suitable for shipping to any sink.
 */
export const logger = pino({
    level: config.LOG_LEVEL,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level(label) {
            return { level: label };
        },
    },
});
