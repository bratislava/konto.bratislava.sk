import js from '@eslint/js'
import playwright from 'eslint-plugin-playwright'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // The schema-driven form runner is on its way out — drop this entry along with the directory.
  { ignores: ['src/runner/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Applied to the whole suite rather than just the specs: the page objects and helpers drive the
    // page too, so rules like `no-wait-for-timeout` and `no-force-option` belong there as well.
    ...playwright.configs['flat/recommended'],
    files: ['src/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Assertions live in helpers here, so the rule has to be told what one looks like. Matched by
      // shape rather than by name, so a new `expect…`/`assert…` helper needs no config change.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^(expect|assert)'] }],
    },
  },
)
