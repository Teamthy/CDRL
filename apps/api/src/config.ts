import 'dotenv/config';
import { z } from 'zod';

/**
 * Central, validated configuration. The process fails fast on invalid
 * configuration instead of limping along with silent fallbacks.
 */
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(4000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    RATE_LIMIT_POINTS: z.coerce.number().int().positive().default(6),
    RATE_LIMIT_DURATION: z.coerce.number().int().positive().default(60),
    REDIS_URL: z.string().url().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.enum(['true', 'false']).default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default('no-reply@cdrl.africa'),
    NOTIFY_EMAIL: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
    const parsed = envSchema.safeParse(env);
    if (!parsed.success) {
        // eslint-disable-next-line no-console
        console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
        process.exit(1);
    }
    const cfg = parsed.data;
    if (cfg.NODE_ENV === 'production' && cfg.CORS_ORIGIN.includes('localhost')) {
        // eslint-disable-next-line no-console
        console.error('CORS_ORIGIN must not contain a localhost origin when NODE_ENV=production');
        process.exit(1);
    }
    return cfg;
}

export const config = loadConfig();

/** Parsed list of allowed CORS origins (comma-separated in env). */
export const corsOrigins = config.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
