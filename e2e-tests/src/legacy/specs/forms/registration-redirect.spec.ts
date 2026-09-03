import type { Page } from '@playwright/test'

import { expect, test } from '../../fixtures'
import {
  expectRegistrationSuccess,
  logOut,
  openRegistration,
  submitForm,
} from '../../pages/AccountPage'
import { openForm } from '../../pages/FormPage'
import { continueButton, field } from '../../helpers'

/**
 * A guest fills part of a form, leaves it to register, and comes back to claim the draft.
 *
 * Cypress sources:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/form/formRegistrationRedirect.cy.ts
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/form/formRegistrationRedirect-mobile.cy.ts
 */

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
 * Leaving a part-filled form saves it as a concept, and registering migrates that guest-owned draft
 * to the new account — so the work has to survive the registration, the claim and a reload.
 *
 * Cypress: F04 `formRegistrationRedirect.cy.ts` + `formRegistrationRedirect-mobile.cy.ts` — `it` 1–8.
 */
test(
  'part-filled form survives registration and is claimed by the new account',
  { tag: '@legacy' },
  async ({ page, identity }) => {
    await openForm(page, SLUG)

    // Captured before leaving, so the draft can be compared against it afterwards.
    const formUrl = page.url()

    await test.step('fill in the "žiadateľ" step', async () => {
      for (const [property, value] of Object.entries(ziadatel)) {
        const input = ziadatelInput(page, property)
        await input.fill(value)
        await input.blur()
      }
    })

    await test.step('leave the form for registration', async () => {
      await openRegistration(page)
      await page.waitForURL(/\/registracia/)
    })

    await test.step('register', async () => {
      const form = page.locator('[data-cy=register-form]')
      await form.locator('[data-cy=input-email]').fill(identity.email)
      await form.locator('[data-cy=input-given_name]').fill(identity.givenName)
      await form.locator('[data-cy=input-family_name]').fill(identity.familyName)
      await form.locator('[data-cy=input-password]').fill(identity.password)

      await expect(page.locator('[data-cy=error-message]')).toHaveCount(0)
      await submitForm(page, 'register-form', { turnstile: true })
      await expectRegistrationSuccess(page, identity.email)
    })

    await test.step('skip identity verification', async () => {
      // `AccountSuccessAlert`'s cancel button. Because the redirect target is a municipal-service
      // URL, the app offers identity verification here — this button skips it and calls `redirect()`,
      // taking the user straight back to the form they came from.
      await page.locator('[data-cy=back-button]').click()
      await page.waitForURL(formUrl)
    })

    const migrationModal = page.getByRole('dialog').filter({ hasText: 'Pokračovať vo vypĺňaní?' })

    await test.step('form is locked until it is claimed', async () => {
      // The draft was created by a guest, so the newly registered user has to claim it first.
      // `useFormContext` sets `isReadonly = formMigrationRequired`, which `FormContent` passes to
      // RJSF as `readonly` and which also suppresses `FormControls` entirely.
      await expect(migrationModal).toBeVisible()

      for (const property of Object.keys(ziadatel)) {
        await expect(
          ziadatelInput(page, property),
          `root_ziadatel_${property} must be read-only`,
        ).not.toBeEditable()
      }

      // No way to advance a form you have not claimed yet.
      await expect(page.locator('[data-cy^=continue-button-]')).toHaveCount(0)
    })

    await test.step('claiming the form reloads the page', async () => {
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
    })

    await test.step('form is filled in and editable', async () => {
      await expect(migrationModal).toHaveCount(0)

      // The work must survive being saved as a concept, the registration, and the claim.
      for (const [property, value] of Object.entries(ziadatel)) {
        const input = ziadatelInput(page, property)
        await expect(input, `root_ziadatel_${property}`).toHaveValue(value)
        await expect(input, `root_ziadatel_${property} must be editable`).toBeEditable()
      }

      await expect(continueButton(page)).toBeVisible()
    })

    await test.step('form is unreachable after signing out', async () => {
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
