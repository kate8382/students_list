// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': 'off',
      'func-names': 'off',
      'spaced-comment': ['error', 'always'],
      'no-inline-comments': 'off',
      'multiline-comment-style': 'off',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': ['warn'],
      indent: ['error', 2],
      'no-var': 'error',
      'linebreak-style': ['error', 'unix'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'no-restricted-globals': 'off',
      'no-alert': 'off',
      'no-plusplus': 'off',
      'max-len': ['error', { code: 130 }],
      'no-param-reassign': ['off'],
    }
  }
]);
