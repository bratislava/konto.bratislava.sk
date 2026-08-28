import type { Page } from '@playwright/test'

import { expect, test } from '../../../fixtures'
import { expectRegistrationSuccess, logOut, submitForm } from '../../../pages/AccountPage'
import { openForm, waitForHydration } from '../../../pages/FormPage'
import { continueButton, field } from '../helpers'

/**
 * Was `tests/cypress/e2e/form/formRegistrationRedirect.cy.ts` and its near-identical twin
 * `formRegistrationRedirect-mobile.cy.ts` (F04). The two files differed only in which device they
 * ran on and how they reached the register link, so they collapse into one spec that runs under
 * both viewport projects.
 *
 * Note the Cypress pair shared the describe name `F04 -`, which meant the desktop and mobile runs
 * also shared visual-regression baselines.
 */
test.use({ storageState: { cookies: [], origins: [] } })

const SLUG = 'stanovisko-k-investicnemu-zameru'

/** Keyed by the `ziadatel` schema property, so the ids are derived rather than hand-written. */
const ziadatel = {
  meno: 'Cypress',
  priezvisko: 'Name',
  ulicaACislo: 'Test address 1',
  mesto: 'City',
  psc: '12345',
  email: 'cypress@test.cz',
  telefon: '+421444333222',
}

const ziadatelInput = (page: Page, property: string) =>
  field(page, `root_ziadatel_${property}`).locator('input').first()

/**
 * The core assertion is the last step: leaving a part-filled form saves it as a concept, and
 * registering migrates that guest-owned draft to the new account, so the work must survive both.
 */
test(
  'rozpracovaný formulár vedie na registráciu a registrácia prebehne',
  { tag: '@legacy' },
  async ({ page, identity }) => {
    await openForm(page, SLUG)

    const closeModal = page.locator('[data-cy=close-modal]')
    if (await closeModal.isVisible().catch(() => false)) {
      await closeModal.click()
    }

    // Captured before leaving, so the draft can be compared against it afterwards.
    const formUrl = page.url()

    await test.step('vyplnenie kroku "Žiadateľ"', async () => {
      for (const [property, value] of Object.entries(ziadatel)) {
        const input = ziadatelInput(page, property)
        await input.fill(value)
        await input.blur()
      }
    })

    await test.step('odchod z formulára na registráciu', async () => {
      // Desktop shows the register button in the navbar; mobile hides it behind the account menu.
      const registerButton = page.locator('[data-cy=register-button]')
      if (await registerButton.isVisible().catch(() => false)) {
        await registerButton.click()
      } else {
        await page.locator('[data-cy=mobile-account-button]').click()
        await page.locator('[data-cy="Registrácia-menu-item"]').click()
      }

      // Leaving a form with unsaved work routes through the registration modal rather than
      // navigating straight away, so accept either path.
      const modalButton = page.locator('[data-cy=registration-modal-button]')
      if (await modalButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await modalButton.click()
      }

      await page.waitForURL(/\/registracia/)
      await waitForHydration(page)
    })

    await test.step('registrácia', async () => {
      const form = page.locator('[data-cy=register-form]')
      await form.locator('[data-cy=input-email]').fill(identity.email)
      await form.locator('[data-cy=input-given_name]').fill(identity.givenName)
      await form.locator('[data-cy=input-family_name]').fill(identity.familyName)
      await form.locator('[data-cy=input-password]').fill(identity.password)

      // Filled inline rather than via `registerAccount`: reaching the registration form *with the
      // form's work preserved* is the point of this test, so the navigation must not be short-circuited.
      await expect(page.locator('[data-cy=error-message]')).toHaveCount(0)
      await submitForm(page, 'register-form', { turnstile: true })
      await expectRegistrationSuccess(page, identity.email)
    })

    await test.step('preskočenie overenia totožnosti', async () => {
      // `AccountSuccessAlert`'s cancel button. Because the redirect target is a municipal-service
      // URL, the app offers identity verification here — this button skips it and calls `redirect()`,
      // taking the user straight back to the form they came from.
      await page.locator('[data-cy=back-button]').click()
      await page.waitForURL(formUrl)
      await waitForHydration(page)
    })

    const migrationModal = page.getByRole('dialog').filter({ hasText: 'Pokračovať vo vypĺňaní?' })

    await test.step('žiadosť je uzamknutá, kým sa neprevezme', async () => {
      // The draft was created by a guest, so the newly registered user has to claim it first.
      // `useFormContext` sets `isReadonly = formMigrationRequired`, which `FormContent` passes to
      // RJSF as `readonly` and which also suppresses `FormControls` entirely.
      await expect(migrationModal).toBeVisible()

      for (const property of Object.keys(ziadatel)) {
        await expect(
          ziadatelInput(page, property),
          `root_ziadatel_${property} musí byť neupravovateľné`,
        ).not.toBeEditable()
      }

      // No way to advance a form you have not claimed yet.
      await expect(page.locator('[data-cy^=continue-button-]')).toHaveCount(0)
    })

    await test.step('prevzatie žiadosti prenačíta stránku', async () => {
      const claimed = page.waitForResponse(
        (response) =>
          response.url().includes('/forms/migrations/claim/') &&
          response.request().method() === 'POST',
      )
      // `migrateForm` claims the draft and then calls `router.reload()` on success.
      const reloaded = page.waitForEvent('load')

      await migrationModal.getByRole('button', { name: 'Pokračovať vo vypĺňaní' }).click()

      expect((await claimed).ok()).toBe(true)
      await reloaded
      await waitForHydration(page)
    })

    await test.step('formulár je vyplnený a upravovateľný', async () => {
      await expect(migrationModal).toHaveCount(0)

      // The work must survive being saved as a concept, the registration, and the claim.
      for (const [property, value] of Object.entries(ziadatel)) {
        const input = ziadatelInput(page, property)
        await expect(input, `root_ziadatel_${property}`).toHaveValue(value)
        await expect(input, `root_ziadatel_${property} musí byť upravovateľné`).toBeEditable()
      }

      await expect(continueButton(page)).toBeVisible()
    })

    await test.step('po odhlásení nie je žiadosť dostupná', async () => {
      await logOut(page)

      // The draft now belongs to a real account, so a signed-out visitor must not reach it.
      // `[slug]/[id].tsx` turns the backend's 401/403 into a redirect to the login page, carrying the
      // original URL in the `from` query param so the user lands back on the form after signing in.
      await page.goto(formUrl)
      await page.waitForURL((url) => url.pathname === '/prihlasenie')

      const formPath = new URL(formUrl).pathname
      expect(new URL(page.url()).searchParams.get('from')).toContain(formPath)
      await expect(page.locator('[data-cy=login-container]')).toBeVisible()
    })
  },
)
