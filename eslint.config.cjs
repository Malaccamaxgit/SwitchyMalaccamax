/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  // Mimic ESLintRC-style extends
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-recommended'),

  // Env: include browser and testing globals (vitest)
  ...compat.env({
    browser: true,
    node: true,
    vitest: true,
  }),

  // Project overrides (parser options, globals, and local rule tweaks)
  ...compat.config({
    parser: 'vue-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    globals: {
      chrome: 'readonly',
      globalThis: 'readonly',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  }),

  { ignores: ['dist/', 'public/', 'coverage/', 'node_modules/', '.vscode/', '*.min.js', 'src/components/demo/**'] },
];
