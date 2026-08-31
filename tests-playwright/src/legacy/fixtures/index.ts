import { randomUUID } from 'node:crypto'

import { test as base } from '@playwright/test'

import { registerAccount } from '../pages/AccountPage'
import { createIdentity, type Identity } from './identity'

type TestFixtures = {
  identity: Identity
  /**
   * A freshly registered, signed-in account, unique to this test.
   */
  registeredAccount: Identity
}

export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  identity: async ({}, use, testInfo) => {
    await use(createIdentity(testInfo.parallelIndex, randomUUID().slice(0, 8)))
  },

  registeredAccount: async ({ page, identity }, use) => {
    await registerAccount(page, identity)
    await use(identity)
  },
})

export { expect } from '@playwright/test'
