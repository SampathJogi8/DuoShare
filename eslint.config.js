import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // Frontend JS/JSX files
    files: ['src/**/*.{js,jsx}', 'vite.config.js', 'eslint.config.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Cloud functions/Node JS files
    files: ['functions/**/*.js', 'check_logs_schema.js', 'query_catalog.js', 'read_logs.js'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
])

