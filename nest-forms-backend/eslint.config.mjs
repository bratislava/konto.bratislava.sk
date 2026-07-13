import { createNestConfig } from '@bratislava/eslint-config-nest'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  globalIgnores(['src/generated/prisma/']),
])
