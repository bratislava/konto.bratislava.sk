import { randomUUID } from 'node:crypto'

import { BASE_URL } from '../playwright.config'

/**
 * Deliberately no `webServer`.
 *
 * Starting the app would mean running `tests/package.json` -> `start:e2e`, which copies
 * `.env.ci-build.e2e` over `next/.env.production.local` and takes minutes. A test runner must not
 * mutate the app package as a side effect, so we assert the app is up and fail fast instead.
 */
const globalSetup = async () => {
  // Shared by every worker to namespace generated identities. See `src/legacy/fixtures/identity.ts`.
  process.env.E2E_RUN_ID = randomUUID().slice(0, 8)

  let status: number
  try {
    const response = await fetch(BASE_URL, { redirect: 'manual' })
    status = response.status
  } catch (error) {
    throw new Error(
      `Could not reach the app at ${BASE_URL} (${(error as Error).message}).\n` +
        `Start it with the e2e environment first:\n` +
        `  pnpm --filter city-account-cypress-tests run start:e2e\n` +
        `Or point the suite elsewhere with E2E_BASE_URL.`,
    )
  }

  if (status >= 500) {
    throw new Error(`The app at ${BASE_URL} responded with ${status}. Refusing to run against it.`)
  }

  // eslint-disable-next-line no-console
  console.log(`[e2e] run ${process.env.E2E_RUN_ID} against ${BASE_URL}`)
}

export default globalSetup
