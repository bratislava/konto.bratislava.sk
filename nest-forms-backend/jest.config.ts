import type { Config } from 'jest'

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: {
    // https://github.com/kulshekhar/ts-jest/issues/4198#issuecomment-2766448843
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.dto.ts',
    '!**/*.module.ts',
    '!**/*.enum.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../test/singleton.ts'],
  moduleNameMapper: {
    '^react-markdown$': '<rootDir>/../test/react-markdown-mock.js',
  },
}

export default config
