import astro from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';

export default [
  {
    files: ['**/*.astro'],
    plugins: { astro },
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: { js: '@typescript-eslint/parser' }, // optional, for script blocks
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Add Astro-specific rules here if needed
    },
  },
  {
    files: ['**/*.js'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // JS rules here
    },
  },
];