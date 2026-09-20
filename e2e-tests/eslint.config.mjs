import js from '@eslint/js'
import playwright from 'eslint-plugin-playwright'
import tseslint from 'typescript-eslint'

export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, {
  ...playwright.configs['flat/recommended'],
  files: ['src/**/*.ts'],
  rules: {
    ...playwright.configs['flat/recommended'].rules,
    // Assertions live in helpers here, so the rule has to be told what one looks like. Matched by
    // shape rather than by name, so a new `expect…`/`assert…` helper needs no config change.
    'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^(expect|assert)'] }],
  },
})
