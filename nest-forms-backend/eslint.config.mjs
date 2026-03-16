import { createNestConfig } from '@bratislava/eslint-config-nest'

// TODO - add custom rules from eslint-custom-rules folder

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    rules: {
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'warn', // 14 occurrences
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 8 occurrences
      'no-await-in-loop': 'warn', // 7 occurrences
      'no-console': 'warn', // 9 occurrences
      '@typescript-eslint/no-explicit-any': 'warn', // 3 occurrences
      '@typescript-eslint/no-duplicate-enum-values': 'warn', // 90 occurrences
      '@typescript-eslint/no-extraneous-class': 'warn', // 2 occurrences
      '@typescript-eslint/restrict-template-expressions': 'warn', // 2 occurrences
      'sonarjs/function-return-type': 'warn', // 1 occurrence
      '@typescript-eslint/no-unsafe-call': 'warn', // 2 occurrences
      '@typescript-eslint/no-unsafe-member-access': 'warn', // 6 occurrences
      '@typescript-eslint/no-unsafe-assignment': 'warn', // 5 occurrences
      '@typescript-eslint/no-misused-spread': 'warn', // 6 occurrences
      '@typescript-eslint/no-unnecessary-type-parameters': 'warn', // 1 occurrence
      'sonarjs/no-clear-text-protocols': 'warn', // 8 occurrences
      '@typescript-eslint/no-unsafe-return': 'warn', // 2 occurrences
      '@typescript-eslint/no-empty-function': 'warn', // 16 occurrences
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
    },
  },
]
