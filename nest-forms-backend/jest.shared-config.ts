/** @jest-config-loader ts-node */
import type { Config } from 'jest'

const sharedConfig: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  transform: {
    // https://github.com/kulshekhar/ts-jest/issues/4198#issuecomment-2766448843
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^react-markdown$': '<rootDir>/../test/react-markdown-mock.js',
    '^@x0k/json-schema-merge(.*)$':
      '<rootDir>/../test/json-schema-merge-mock.js',
    '^jsdom$': '<rootDir>/../test/jsdom-mock.js',
  },
}

export default sharedConfig
