import { createNestConfig } from '@bratislava/eslint-config-nest'
import vitest from '@vitest/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    // Tests run on Vitest. The shared config's jest/unbound-method only exempts `jest.mocked(...)`;
    // the Vitest rule exempts `vi.mocked(...)`.
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: { vitest },
    rules: {
      'jest/unbound-method': 'off',
      'vitest/unbound-method': 'error',
    },
  },
  globalIgnores(['src/generated/prisma/']),
])
