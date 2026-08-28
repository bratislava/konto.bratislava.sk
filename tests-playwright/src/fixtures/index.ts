import { randomUUID } from 'node:crypto'

import { test as base } from '@playwright/test'

import { registerAccount } from '../pages/AccountPage'
import { createIdentity, type Identity } from './identity'

type TestFixtures = {
  identity: Identity
  /**
   * A freshly registered, signed-in account, unique to this test.
   *
   * This replaces the shared `accounttest@cypress.test` the Cypress suite used. That account was the
   * only genuine parallelism blocker left: three specs signed into it and two mutated it (a
   * server-side GDPR consent, and a permanent rename), so they had to run serially and under one
   * project only.
   *
   * Registering per test is cheap here because the staging pool auto-confirms the `cypress.test`
   * domain — no verification e-mail is sent, so this does not eat Cognito's e-mail quota — and it
   * removes the last piece of shared mutable state in the suite. It also removes the plaintext
   * staging credentials that used to live in `tests/cypress/fixtures/account.json`.
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
