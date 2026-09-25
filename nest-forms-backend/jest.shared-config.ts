import type { Config } from 'jest'

const sharedConfig: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  transform: {
    // https://github.com/kulshekhar/ts-jest/issues/4198#issuecomment-2766448843
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  testEnvironment: 'node',
}

export default sharedConfig
