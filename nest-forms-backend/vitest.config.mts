import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    setupFiles: ['./test/singleton.ts'],
    alias: {
      '@golevelup/nestjs-rabbitmq': path.resolve(
        'test/rabbitmq-client-mock.js',
      ),
    },
    coverage: {
      include: ['src/**/*.{ts,js}'],
      exclude: ['**/*.dto.ts', '**/*.module.ts', '**/*.enum.ts'],
    },
  },
})
