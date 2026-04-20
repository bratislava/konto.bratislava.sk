/** @jest-config-loader ts-node */
// The config requires full TypeScript support, without explicitly setting it to `ts-node` it fails
// to run using just native Node.js TypeScript support:
// https://nodejs.org/docs/latest/api/typescript.html#full-typescript-support

import type { Config } from 'jest'

import sharedConfig from './jest.shared-config'

const config: Config = {
  ...sharedConfig,
  testRegex: '.emails-spec.ts$',
}

export default config
