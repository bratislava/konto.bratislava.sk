/** @jest-config-loader ts-node */
import type { Config } from 'jest'

import sharedConfig from './jest.shared-config'

const config: Config = {
  ...sharedConfig,
  testRegex: '.e2e-spec.ts$',
  // eslint-disable-next-line xss/no-mixed-html
  setupFiles: ['<rootDir>/../test/e2e-env-setup.ts'],
  // eslint-disable-next-line xss/no-mixed-html
  globalSetup: '<rootDir>/../test/e2e-global-setup.ts',
  // eslint-disable-next-line xss/no-mixed-html
  globalTeardown: '<rootDir>/../test/e2e-global-teardown.ts',
}

export default config
