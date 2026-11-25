import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/e2e-env-setup.ts', './test/log-nest-matchers.ts'],
    globalSetup: ['./test/e2e-global-setup.ts'],
    fileParallelism: false,
    // Booting the Nest app and connecting to MSSQL (emulated on arm64) can take a while.
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
})
