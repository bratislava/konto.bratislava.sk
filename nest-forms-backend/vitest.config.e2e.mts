import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/e2e-env-setup.ts'],
    globalSetup: ['./test/e2e-global-setup.ts'],
  },
})
