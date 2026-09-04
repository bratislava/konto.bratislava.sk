import { getRunId } from '../../runId'

export type Identity = {
  email: string
  /** A syntactically valid address that is guaranteed not to exist, for negative cases. */
  unknownEmail: string
  password: string
  givenName: string
  familyName: string
  companyName: string
}

/**
 * The domain has to stay `cypress.test`.
 *
 * The staging Cognito pool is configured to auto-confirm it, which is what lets a test register a
 * user and sign in immediately without entering a 2FA code (see the comment in
 * `next/src/pages/zmena-emailu.tsx` about confirmation being disabled in E2E).
 */
const EMAIL_DOMAIN = 'cypress.test'

/**
 * Builds an address that cannot collide under parallel workers — a collision means the second
 * registration fails with `UsernameExistsException`.
 *
 * Each component removes one collision axis:
 *  - `runId`         separates runs,
 *  - `parallelIndex` separates concurrent workers — Playwright guarantees at most one test occupies
 *                    a given index at a time,
 *  - `nonce`         separates tests within a worker. A random value rather than a counter, because
 *                    Playwright restarts a worker after a failure, which would reset a counter and
 *                    hand the next test an address a previous one had already registered.
 */
export const createIdentity = (parallelIndex: number, nonce: string): Identity => {
  const runId = getRunId()
  const slug = `e2e-${runId}-${parallelIndex}-${nonce}`

  return {
    email: `${slug}@${EMAIL_DOMAIN}`,
    unknownEmail: `${slug}-neznamy@${EMAIL_DOMAIN}`,
    password: `P@9${runId}${parallelIndex}${nonce}`,
    // These are literal Cognito user-attribute names, so they stay in English — unlike the form
    // field names, where English was a mistranslation of the Slovak schema.
    givenName: 'Cypress_Name',
    familyName: 'Family_Name',
    companyName: 'Cypress_Company_Name',
  }
}
