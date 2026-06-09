import { createNestConfig } from '@bratislava/eslint-config-nest'

import customRulesPlugin from './eslint-custom-rules/index.js'

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    plugins: {
      'custom-rules': customRulesPlugin,
    },
    rules: {
      'custom-rules/thrower-error-guard-enum': 'warn',
    },
  },
  {
    rules: {
      // TODO: fix https://github.com/bratislava/private-konto.bratislava.sk/issues/1320
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'warn', // 14 occurrences
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 8 occurrences
      'no-await-in-loop': 'warn', // 7 occurrences
      'no-console': 'warn', // 9 occurrences
      '@typescript-eslint/no-extraneous-class': 'warn', // 2 occurrences
      '@typescript-eslint/restrict-template-expressions': 'warn', // 2 occurrences
      'sonarjs/function-return-type': 'warn', // 1 occurrence
      '@typescript-eslint/no-misused-spread': 'warn', // 6 occurrences
      '@typescript-eslint/no-unnecessary-type-parameters': 'warn', // 1 occurrence
    },
  },
]
