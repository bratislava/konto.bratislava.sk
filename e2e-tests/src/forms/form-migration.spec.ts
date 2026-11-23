import type { Page } from '@playwright/test'

import { expect, test } from '../legacy/fixtures'
import { continueButton, field } from '../legacy/helpers'
import {
  expectRegistrationSuccess,
  logOut,
  openLogin,
  openRegistration,
  submitForm,
} from '../legacy/pages/AccountPage'
import { openForm } from '../legacy/pages/FormPage'

/**
 * A guest's part-filled form migrates to the account the guest registers or signs in to.
 *
 * Leaving a form for registration or sign-in saves it as a concept. Afterwards the draft is locked until the user
 * claims it, and the work has to survive the claim and a reload. Signing in links the guest identity to the user in
 * Cognito, so the draft reaches the account through the forms backend's own migration, not through the guest identity.
 *
 * Cypress sources (the registration path):
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

/** Opens a new form as a guest and fills in the "žiadateľ" step. Returns the form's URL. */
const startGuestDraft = (page: Page) =>
  test.step('fill in the "žiadateľ" step of a new form as a guest', async () => {
    await openForm(page, SLUG)

    for (const [property, value] of Object.entries(ziadatel)) {
      const input = ziadatelInput(page, property)
      await input.fill(value)
      await input.blur()
    }

    return page.url()
  })

/** The draft is locked until it is claimed, claiming reloads the page, and the work survives the claim. */
const claimDraft = async (page: Page) => {
  const migrationModal = page.getByRole('dialog').filter({ hasText: 'Pokračovať vo vypĺňaní?' })

  await test.step('form is locked until it is claimed', async () => {
    // `useFormContext` sets `isReadonly = formMigrationRequired`, which `FormContent` passes to RJSF as `readonly` and
    // which also suppresses `FormControls` entirely.
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

    for (const [property, value] of Object.entries(ziadatel)) {
      const input = ziadatelInput(page, property)
      await expect(input, `root_ziadatel_${property}`).toHaveValue(value)
      await expect(input, `root_ziadatel_${property} must be editable`).toBeEditable()
    }

    await expect(continueButton(page)).toBeVisible()
  })
}

/**
 * One account for both paths: registering creates it, and signing in needs an existing one, so the paths run in
 * sequence rather than as two tests.
 *
 * Cypress: F04 `formRegistrationRedirect.cy.ts` + `formRegistrationRedirect-mobile.cy.ts` — `it` 1–8, then signing
 * in, which Cypress did not cover.
 */
test(
  'a guest draft is claimed after registering, and after signing in',
  { tag: '@forms' },
  async ({ page, identity }) => {
    // Two guest forms, a registration and a sign-in: many sequential staging round-trips, one behind Turnstile.
    test.slow()

    const registrationDraftUrl = await startGuestDraft(page)

    await test.step('leave the form for registration and register', async () => {
      await openRegistration(page)
      await page.waitForURL(/\/registracia/)

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
      // `AccountSuccessAlert`'s cancel button. Because the redirect target is a municipal-service URL, the app offers
      // identity verification here — this button skips it and calls `redirect()`, taking the user straight back to
      // the form they came from.
      await page.locator('[data-cy=back-button]').click()
      await page.waitForURL(registrationDraftUrl)
    })

    await claimDraft(page)

    await test.step('the claimed form is unreachable after signing out', async () => {
      await logOut(page)

      // The draft now belongs to a real account, so a signed-out visitor must not reach it. `[slug]/[id].tsx` turns
      // the backend's 401/403 into a redirect to the login page, carrying the original URL in the `from` query param
      // so the user lands back on the form after signing in.
      await page.goto(registrationDraftUrl)
      await page.waitForURL((url) => url.pathname === '/prihlasenie')

      expect(new URL(page.url()).searchParams.get('from')).toContain(
        new URL(registrationDraftUrl).pathname,
      )
      await expect(page.locator('[data-cy=login-container]')).toBeVisible()
    })

    const signInDraftUrl = await startGuestDraft(page)

    await test.step('leave the form to sign in and sign in', async () => {
      await openLogin(page)
      await page.waitForURL((url) => url.pathname === '/prihlasenie')

      const form = page.locator('[data-cy=login-container]')
      await form.locator('[data-cy=input-email]').fill(identity.email)
      await form.locator('[data-cy=input-password]').fill(identity.password)
      await form.locator('[data-cy=login-button]').click()

      // Signing in redirects back to the form the user came from.
      await page.waitForURL(signInDraftUrl, { timeout: 30_000 })
    })

    await claimDraft(page)
  },
)
