/** @jest-config-loader ts-node */
// The config requires full TypeScript support, without explicitly setting it to `ts-node` it fails
// to run using just native Node.js TypeScript support:
// https://nodejs.org/docs/latest/api/typescript.html#full-typescript-support

import type { Config } from 'jest'

import sharedConfig from './jest.shared-config'

const config: Config = {
  ...sharedConfig,
  testRegex: String.raw`.*\.spec\.ts$`,
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.dto.ts',
    '!**/*.module.ts',
    '!**/*.enum.ts',
  ],
  coverageDirectory: '../coverage',
  // eslint-disable-next-line xss/no-mixed-html
  setupFilesAfterEnv: ['<rootDir>/../test/singleton.ts'],
  moduleNameMapper: {
    ...sharedConfig.moduleNameMapper,
    // eslint-disable-next-line no-secrets/no-secrets
    '^@golevelup/nestjs-rabbitmq$': '<rootDir>/../test/rabbitmq-client-mock.js',
  },
}

export default config
