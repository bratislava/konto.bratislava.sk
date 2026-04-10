import { createNestConfig } from '@bratislava/eslint-config-nest'

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  // Project-specific rule overrides
  {
    files: ['**/*.spec.ts', '**/*_test_.ts'],
    rules: {
      'dot-notation': 'off', // to test private methods
      'sonarjs/no-nested-functions': 'off',
      '@typescript-eslint/no-misused-spread': 'off', // spreading DTOs in tests is fine, prototype is irrelevant
    },
  },
]
