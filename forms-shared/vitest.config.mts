import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // https://github.com/vitest-dev/vitest/discussions/4233
    alias: {
      '@rjsf/core': '@rjsf/core/dist/index.esm.js',
      '@rjsf/utils': '@rjsf/utils/dist/utils.esm.js',
      '@rjsf/validator-ajv8': '@rjsf/validator-ajv8/dist/validator-ajv8.esm.js',
    },
  },
  test: {
    include: ['**/tests/**/*.[jt]s?(x)'],
  },
})
