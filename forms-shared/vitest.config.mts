import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/tests/**/*.[jt]s?(x)'],
    snapshotFormat: {
      maxOutputLength: 10_000_000,
    },
  },
})
