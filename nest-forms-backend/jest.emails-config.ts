/** @jest-config-loader ts-node */
import type { Config } from 'jest'

import sharedConfig from './jest.shared-config'

const config: Config = {
  ...sharedConfig,
  testRegex: '.emails-spec.ts$',
}

export default config
