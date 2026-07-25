/* ESLint config for the API (ESLint 8, legacy .eslintrc format). */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    env: { node: true, es2022: true },
    ignorePatterns: ['dist/', 'node_modules/', 'coverage/', 'prisma/migrations/'],
    rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-console': 'off',
    },
};
