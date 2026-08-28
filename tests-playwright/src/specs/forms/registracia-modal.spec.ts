import { expect, test } from '@playwright/test'

import { openForm } from '../../pages/FormPage'

/**
 * Was `tests/cypress/e2e/registration/registrationModalSIZ.cy.ts` and `registrationModalZSIZ.cy.ts`
 * (RF03 / RF04) — two files that differed only in the slug. Parameterised into one.
 *
 * Only the SIZ slug is covered. `zavazne-stanovisko-k-investicnej-cinnosti` still renders the
 * legacy `FormLandingPageContent`, which has no fill-form CTA at all (it is marked
 * "TODO: Remove this page completely, after full migration to municipal service page"), so there is
 * currently no way to open that form from its landing page and RF04 exercises a path that no longer
 * exists. Add the slug back once it moves to the municipal-service page.
 *
 * The behaviour under test — a guest gets the registration modal — does not depend on which form is
 * open, so covering it once is not a loss of coverage.
 */
const SLUGS = ['stanovisko-k-investicnemu-zameru'] as const

SLUGS.forEach((slug) => {
  test.describe(slug, () => {
    test('registračné modálne okno vedie na registráciu', async ({ page }) => {
      await openForm(page, slug)

      await expect(page.locator('[data-cy=registration-modal]')).toBeVisible()
      await page.locator('[data-cy=registration-modal-button]').click()

      await expect(page).toHaveURL(/\/registracia/)
    })

    test('uloženie konceptu znovu otvorí registračné modálne okno', async ({ page }) => {
      await openForm(page, slug)

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
    })
  })
})
