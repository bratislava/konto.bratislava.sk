/** @jest-config-loader ts-node */
import { Config } from 'jest'

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
