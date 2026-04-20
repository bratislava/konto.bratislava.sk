import { createNestConfig } from '@bratislava/eslint-config-nest'

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  // Project-specific rule overrides
  {
    rules: {
      // TODO: Fix these occurrences
      'no-implicit-coercion': 'warn', // 39 occurrences
      'sonarjs/no-os-command-from-path': 'warn', // 1 occurence
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'warn', // 2 occurrences
      'sonarjs/cognitive-complexity': 'warn', // 4 occurrences
      '@typescript-eslint/no-unsafe-member-access': 'warn', // 25 occurrences
      '@typescript-eslint/no-deprecated': 'warn', // 1 occurrence
      '@typescript-eslint/no-misused-spread': 'warn', // 7 occurrences
      '@typescript-eslint/no-unnecessary-type-parameters': 'warn', // 1 occurrence
      '@typescript-eslint/no-non-null-assertion': 'warn', // 3 occurrences
      '@typescript-eslint/no-unsafe-assignment': 'warn', // 15 occurrences
      '@typescript-eslint/restrict-template-expressions': 'warn', // 1 occurrence
      '@typescript-eslint/no-base-to-string': 'warn', // 1 occurrence
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 1 occurrence
      'sonarjs/no-ignored-exceptions': 'warn', // 1 occurrence
      '@typescript-eslint/no-unused-vars': 'warn', // 1 occurrence
      '@typescript-eslint/no-extraneous-class': 'warn', // 1 occurrence
      'sonarjs/no-empty-test-file': 'warn', // 1 occurrence
      '@typescript-eslint/no-dynamic-delete': 'warn', // 1 occurrence
    },
  },
  {
    files: ['**/*.spec.ts', '**/*_test_.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'dot-notation': 'off', // to test private methods
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'sonarjs/no-nested-functions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
]
