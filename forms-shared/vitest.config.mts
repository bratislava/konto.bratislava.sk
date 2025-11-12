import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/tests/**/*.[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/*.d.ts'],
  },
})
