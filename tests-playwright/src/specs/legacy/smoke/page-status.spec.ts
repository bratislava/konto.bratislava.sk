import { expect, test } from '@playwright/test'

import { smokeUrls } from '../../../data/smoke-urls'

/**
 * Was `tests/cypress/e2e/smokeTests/pageStatusVerification.cy.ts`, which looped all six URLs inside
 * a single `it` using `failOnStatusCode: pathObject.status === 200`. That double negative meant one
 * regression masked the other five. One test per URL instead: they run in parallel, need no
 * browser, and each failure names its own URL.
 */
smokeUrls.forEach(({ path, status }) => {
  test(`${path} vracia ${status}`, { tag: '@legacy' }, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 })

    expect(response.status()).toBe(status)
  })
})
