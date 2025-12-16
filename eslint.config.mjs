// // @ts-check
// import eslint from '@eslint/js';
// import prettierPlugin from 'eslint-plugin-prettier';
// import globals from 'globals';
// import tseslint from 'typescript-eslint';

// export default [
//   {
//     ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'coverage/**'],
//   },
//   eslint.configs.recommended,
//   ...tseslint.configs.recommendedTypeChecked,
//   {
//     files: ['**/*.ts'],
//     plugins: {
//       prettier: prettierPlugin,
//     },
//     rules: {
//       'prettier/prettier': ['error', {
//         endOfLine: 'auto',
//         singleQuote: true,
//         trailingComma: 'es5',
//         tabWidth: 2,
//         semi: true,
//         printWidth: 100,
//       }],
//     },
//   },
//   {
//     files: ['**/*.ts'],
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//       ecmaVersion: 'latest',
//       sourceType: 'module',
//       parserOptions: {
//         projectService: true,
//         tsconfigRootDir: import.meta.dirname,
//       },
//     },
//     rules: {
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/no-floating-promises': 'warn',
//       '@typescript-eslint/no-unsafe-argument': 'warn',
//       '@typescript-eslint/no-unsafe-assignment': 'warn',
//       '@typescript-eslint/no-unsafe-member-access': 'warn',
//       '@typescript-eslint/no-unsafe-call': 'warn',
//       '@typescript-eslint/require-await': 'warn',
//       '@typescript-eslint/await-thenable': 'warn',
//       'no-console': 'warn',
//     },
//   },
// ];


module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};