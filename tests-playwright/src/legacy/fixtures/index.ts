import { randomUUID } from 'node:crypto'

import { test as base } from '@playwright/test'

import { createIdentity, type Identity } from './identity'

type TestFixtures = {
  identity: Identity
}

export const test = base.extend<TestFixtures>({
  identity: async ({}, use, testInfo) => {
    await use(createIdentity(testInfo.parallelIndex, randomUUID().slice(0, 8)))
  },
})

export { expect } from '@playwright/test'
