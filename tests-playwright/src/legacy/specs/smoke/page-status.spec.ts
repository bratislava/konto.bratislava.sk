import { expect, test } from '@playwright/test'

import { smokeUrls } from '../../data/smoke-urls'

/**
 * Status codes of the pages that must always answer. One test per URL, so a failure names the URL.
 *
 * Cypress source:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/smokeTests/pageStatusVerification.cy.ts
 */
smokeUrls.forEach(({ path, status }) => {
  /** Cypress: `pageStatusVerification.cy.ts` — `Verification of successful page loading`. */
  test(`${path} returns ${status}`, { tag: '@legacy' }, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 })

    expect(response.status()).toBe(status)
  })
})
