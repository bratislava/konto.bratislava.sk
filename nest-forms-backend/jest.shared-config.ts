import type { Config } from 'jest'

const sharedConfig: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  transform: {
    // https://github.com/kulshekhar/ts-jest/issues/4198#issuecomment-2766448843
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  // forms-shared and openapi-clients are linked from the workspace, so their
  // real paths are outside node_modules. Their builds are native ESM and must
  // load as is, not be compiled to CommonJS.
  transformIgnorePatterns: [
    '/node_modules/',
    '/forms-shared/dist/',
    '/openapi-clients/dist/',
  ],
  testEnvironment: 'node',
}

export default sharedConfig
