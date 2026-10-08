import { describe, expect, it } from 'vitest';

/**
 * Audit finding P0-6: LEARNER_JWT_SECRET and PAYSTACK_SECRET_KEY appeared in no
 * .env.example and were not forwarded by docker-compose.prod.yml, so the LMS and
 * payments could not be switched on at all.
 *
 * Forwarding them exposed a second, sharper problem: Compose renders an unset
 * optional as an EMPTY STRING (`FOO: ${FOO:-}` sets FOO=""). '' is not
 * undefined, so it reached .email() / .url() / .min(32), loadConfig failed, and
 * the API called process.exit(1) — the container crash-looped rather than
 * running with that feature dormant. Blank now means "not set".
 */

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/test';

const { loadConfig } = await import('./config.js');

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' } as NodeJS.ProcessEnv;

describe('loadConfig', () => {
    it('accepts the empty strings docker-compose passes for unset optionals', () => {
        const cfg = loadConfig({
            ...base,
            // Exactly what `${VAR:-}` renders when the operator sets nothing.
            ADMIN_EMAIL: '',
            ADMIN_PASSWORD: '',
            ADMIN_JWT_SECRET: '',
            LEARNER_JWT_SECRET: '',
            PUBLIC_WEB_URL: '',
            PAYSTACK_SECRET_KEY: '',
            REDIS_URL: '',
            SMTP_HOST: '',
            SMTP_USER: '',
            SMTP_PASS: '',
            NOTIFY_EMAIL: '',
        });

        expect(cfg.ADMIN_EMAIL).toBeUndefined();
        expect(cfg.LEARNER_JWT_SECRET).toBeUndefined();
        expect(cfg.PAYSTACK_SECRET_KEY).toBeUndefined();
        expect(cfg.PUBLIC_WEB_URL).toBeUndefined();
        expect(cfg.REDIS_URL).toBeUndefined();
    });

    it('keeps defaults intact when the var is blank rather than absent', () => {
        const cfg = loadConfig({ ...base, SMTP_PORT: '', SMTP_SECURE: '', SMTP_FROM: '' });
        expect(cfg.SMTP_PORT).toBe(587);
        expect(cfg.SMTP_SECURE).toBe('false');
        expect(cfg.SMTP_FROM).toBe('no-reply@ykayconsultinghub.com.ng');
    });

    it('still reads real values when they are provided', () => {
        const secret = 'learner-secret-learner-secret-32xyz!';
        const cfg = loadConfig({
            ...base,
            LEARNER_JWT_SECRET: secret,
            PAYSTACK_SECRET_KEY: 'sk_test_abc123',
            PUBLIC_WEB_URL: 'https://www.example.com',
            ADMIN_EMAIL: 'admin@example.com',
        });

        expect(cfg.LEARNER_JWT_SECRET).toBe(secret);
        expect(cfg.PAYSTACK_SECRET_KEY).toBe('sk_test_abc123');
        expect(cfg.PUBLIC_WEB_URL).toBe('https://www.example.com');
        expect(cfg.ADMIN_EMAIL).toBe('admin@example.com');
    });

    it('treats whitespace-only values as unset too', () => {
        const cfg = loadConfig({ ...base, LEARNER_JWT_SECRET: '   ' });
        expect(cfg.LEARNER_JWT_SECRET).toBeUndefined();
    });
});
