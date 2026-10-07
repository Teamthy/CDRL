import { defineConfig } from 'vitest/config';

export default defineConfig({
    // tsconfig keeps `jsx: preserve` for Next; tests need real JSX output.
    // The component tests only create React elements (no DOM rendering).
    oxc: { jsx: { runtime: 'automatic' } },
    test: {
        environment: 'node',
    },
});
