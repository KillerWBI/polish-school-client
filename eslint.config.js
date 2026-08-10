import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Конфиги в корне исполняет Node, а не браузер: без этого `process.cwd()` в
  // vite.config.js падает на no-undef. `npm run lint` — это `eslint .`, то есть
  // весь репозиторий, а не только src.
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
])
