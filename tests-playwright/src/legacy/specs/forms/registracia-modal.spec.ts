import { expect, test } from '@playwright/test'

import { openForm } from '../../pages/FormPage'

/**
 * Was `tests/cypress/e2e/registration/registrationModalSIZ.cy.ts` (RF03) and
 * `registrationModalZSIZ.cy.ts` (RF04) — two files that differed only in the slug. Parameterised
 * into one.
 */
const SLUGS = [
  'stanovisko-k-investicnemu-zameru',
  'zavazne-stanovisko-k-investicnej-cinnosti',
] as const

SLUGS.forEach((slug) => {
  test.describe(slug, () => {
    test('registračné modálne okno vedie na registráciu', { tag: '@legacy' }, async ({ page }) => {
      await openForm(page, slug, { dismissRegistrationModal: false })

      await expect(page.locator('[data-cy=registration-modal]')).toBeVisible()
      await page.locator('[data-cy=registration-modal-button]').click()

      await expect(page).toHaveURL(/\/registracia/)
    })

    test(
      'uloženie konceptu znovu otvorí registračné modálne okno',
      { tag: '@legacy' },
      async ({ page }) => {
        await openForm(page, slug, { dismissRegistrationModal: false })

        await page.locator('[data-cy=close-modal]').click()
        await expect(page.locator('[data-cy=registration-modal]')).toBeHidden()

        // Both buttons exist at all times, hidden per breakpoint — picking the visible one keeps this
        // viewport-agnostic instead of branching on a device string.
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
