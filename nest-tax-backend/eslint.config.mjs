import { createNestConfig } from '@bratislava/eslint-config-nest'

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    rules: {
      // TODO: fix https://github.com/bratislava/private-konto.bratislava.sk/issues/1300
      '@typescript-eslint/prefer-literal-enum-member': 'warn',
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'warn', // 5 occurrences in codebase; should be addressed and fixed
      // Moved from file-level eslint-disable; counts are total rule violations (from npm run lint)
      '@typescript-eslint/no-unsafe-return': 'warn', // 1 occurrence
      '@typescript-eslint/no-unsafe-member-access': 'warn', // 7 occurrences
      '@typescript-eslint/no-unsafe-call': 'warn', // 1 occurrence
      '@typescript-eslint/no-unsafe-assignment': 'warn', // 11 occurrences
      'sonarjs/function-return-type': 'warn', // 1 occurrence
      '@typescript-eslint/no-misused-spread': 'warn', // 3 occurrences
      '@typescript-eslint/no-namespace': 'warn', // 1 occurrence
      'sonarjs/redundant-type-aliases': 'warn', // 1 occurrence
      '@typescript-eslint/no-explicit-any': 'warn', // 4 occurrences
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 4 occurrences
      '@typescript-eslint/restrict-template-expressions': 'warn', // 1 occurrence
      'sonarjs/no-ignored-exceptions': 'warn', // 1 occurrence
      '@typescript-eslint/no-unused-vars': 'warn', // 2 occurrences
      '@typescript-eslint/no-base-to-string': 'warn', // 1 occurrence
      '@typescript-eslint/no-non-null-assertion': 'warn', // 1 occurrence
      '@typescript-eslint/no-unsafe-argument': 'warn', // 1 occurrence
      '@typescript-eslint/no-empty-function': 'warn', // 17 occurrences
      'no-implicit-coercion': 'warn', // 1 occurrence
    },
  },
  // Project-specific rule overrides
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
    },
  },
]
