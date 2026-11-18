import { createNestConfig } from '@bratislava/eslint-config-nest'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
    testRunner: 'vitest',
  }),
  globalIgnores(['src/generated/prisma/']),
])
