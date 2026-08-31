import { expect, test } from '@playwright/test'

import { openForm } from '../../pages/FormPage'

/**
 * The registration modal a guest is greeted with on a form, for both forms that show it.
 *
 * Cypress sources:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/registration/registrationModalSIZ.cy.ts
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/registration/registrationModalZSIZ.cy.ts
 */
const SLUGS = [
  'stanovisko-k-investicnemu-zameru',
  'zavazne-stanovisko-k-investicnej-cinnosti',
] as const

SLUGS.forEach((slug) => {
  test.describe(slug, () => {
    /** Cypress: RF03 / RF04 — `1. Registration modal is redirecting to registration page`. */
    test(
      'registration modal links to the registration page',
      { tag: '@legacy' },
      async ({ page }) => {
        await openForm(page, slug, { dismissRegistrationModal: false })

        await expect(page.locator('[data-cy=registration-modal]')).toBeVisible()
        await page.locator('[data-cy=registration-modal-button]').click()

        await expect(page).toHaveURL(/\/registracia/)
      },
    )

    /** Cypress: RF03 / RF04 — `2. Reopening registration modal with save as a concept button`. */
    test(
      'saving a concept reopens the registration modal',
      { tag: '@legacy' },
      async ({ page }) => {
        await openForm(page, slug, { dismissRegistrationModal: false })

        await page.locator('[data-cy=close-modal]').click()
        await expect(page.locator('[data-cy=registration-modal]')).toBeHidden()

        await page
          .locator('[data-cy=save-concept-desktop], [data-cy=save-concept-mobile]')
          .locator('visible=true')
          .first()
          .click()

        await expect(page.locator('[data-cy=registration-modal]')).toBeVisible()
      },
    )
  })
})
