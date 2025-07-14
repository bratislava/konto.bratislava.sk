import type { Config } from 'jest'

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.e2e-spec.ts$',
  transform: {
    // https://github.com/kulshekhar/ts-jest/issues/4198#issuecomment-2766448843
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^react-markdown$': '<rootDir>/../test/react-markdown-mock.js',
  },
  // eslint-disable-next-line xss/no-mixed-html
  setupFiles: ['<rootDir>/../test/e2e-env-setup.ts'],
  // eslint-disable-next-line xss/no-mixed-html
  globalSetup: '<rootDir>/../test/e2e-global-setup.ts',
  // eslint-disable-next-line xss/no-mixed-html
  globalTeardown: '<rootDir>/../test/e2e-global-teardown.ts',
}

export default config
