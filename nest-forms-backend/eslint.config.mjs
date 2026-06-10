import { createNestConfig } from '@bratislava/eslint-config-nest'

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    rules: {
      // TODO: fix https://github.com/bratislava/private-konto.bratislava.sk/issues/1320
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 8 occurrences
      'no-await-in-loop': 'warn', // 7 occurrences
      'no-console': 'warn', // 9 occurrences
      '@typescript-eslint/no-misused-spread': 'warn', // 6 occurrences
    },
  },
]
