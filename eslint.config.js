import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tsFiles = ['**/*.{ts,tsx}']

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'archive/**', 'api/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: tsFiles,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: tsFiles,
    languageOptions: {
      ...config.languageOptions,
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        tsconfigRootDir: __dirname,
      },
    },
  })),
  {
    files: tsFiles,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
