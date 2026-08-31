import { expect, test } from '../../fixtures'
import {
  expectFieldErrors,
  expectRegistrationSuccess,
  logIn,
  logOut,
  openProfile,
  submitForm,
} from '../../pages/AccountPage'
import { waitForHydration } from '../../pages/FormPage'

/**
 * Registration of both account types, and the e-mail and password changes that follow it.
 *
 * Every test registers its own account, so nothing here is shared or ordered.
 *
 * Cypress sources:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/registration/registration.cy.ts
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/registration/registrationPO.cy.ts
 */

/** Cypress: RF01 `registration.cy.ts` — `it` 1–6. */
test('registering a personal account', { tag: '@legacy' }, async ({ page, identity }) => {
  await page.goto('/registracia')
  await waitForHydration(page)

  await test.step('empty form is rejected with errors', async () => {
    await submitForm(page, 'register-form', { turnstile: true })

    // `turnstileToken` is required too, but it has no rendered field, so it cannot be flagged.
    await expectFieldErrors(page, 'register-form', [
      'email',
      'given_name',
      'family_name',
      'password',
    ])
    await expect(page).toHaveURL(/\/registracia/)
  })

  await test.step('fill in and submit', async () => {
    const form = page.locator('[data-cy=register-form]')
    await expect(form.locator('[data-cy="radio-fyzická-osoba"] input')).toBeChecked()

    await form.locator('[data-cy=input-email]').fill(identity.email)
    await form.locator('[data-cy=input-given_name]').fill(identity.givenName)
    await form.locator('[data-cy=input-family_name]').fill(identity.familyName)
    await form.locator('[data-cy=input-password]').fill(identity.password)

    await expect(page.locator('[data-cy=error-message]')).toHaveCount(0)
    await submitForm(page, 'register-form', { turnstile: true })
  })

  await expectRegistrationSuccess(page, identity.email)
})

/** Cypress: RF02 `registrationPO.cy.ts` — `it` 1–6. */
test('registering a company account', { tag: '@legacy' }, async ({ page, identity }) => {
  await page.goto('/registracia')
  await waitForHydration(page)

  const form = page.locator('[data-cy=register-form]')
  await form.locator('[data-cy="radio-právnická-osoba"]').click()

  await test.step('empty form is rejected with errors', async () => {
    await submitForm(page, 'register-form', { turnstile: true })

    await expectFieldErrors(page, 'register-form', ['email', 'name', 'password'])
    await expect(page).toHaveURL(/\/registracia/)
  })

  await test.step('fill in and submit', async () => {
    await form.locator('[data-cy=input-email]').fill(identity.email)
    await form.locator('[data-cy=input-name]').fill(identity.companyName)
    await form.locator('[data-cy=input-password]').fill(identity.password)

    await expect(page.locator('[data-cy=error-message]')).toHaveCount(0)
    await submitForm(page, 'register-form', { turnstile: true })
  })

  await expectRegistrationSuccess(page, identity.email)
})

/**
 * Genuinely sequential — the new password has to be set on the account whose e-mail just changed —
 * so it is one test with steps rather than two.
 *
 * Cypress: A02 `registration.cy.ts` — `it` 1–5.
 */
test('changing e-mail and password', { tag: '@legacy' }, async ({ page, registeredAccount }) => {
  await logOut(page)
  await logIn(page, registeredAccount.email, registeredAccount.password)

  await test.step('change e-mail', async () => {
    await openProfile(page)
    await page.locator('[data-cy=edit-personal-information-button]').click()
    await page.locator('[data-cy=change-email-button]').click()
    await expect(page).toHaveURL(/\/zmena-emailu/)

    const form = page.locator('[data-cy=change-email-form]')
    await form.locator('[data-cy=input-newEmail]').fill(registeredAccount.email)
    await form.locator('[data-cy=input-password]').fill(registeredAccount.password)
    await page.locator('[data-cy=change-email-submit]').click()

    await expectRegistrationSuccess(page, registeredAccount.email)
  })

  await test.step('change password', async () => {
    await page.goto('/moj-profil')
    await waitForHydration(page)
    await page.locator('[data-cy=change-password-button]').click()
    await expect(page).toHaveURL(/\/zmena-hesla/)

    const form = page.locator('[data-cy=change-password-form]')
    await form.locator('[data-cy=input-oldPassword]').fill(registeredAccount.password)
    await form.locator('[data-cy=input-password]').fill(registeredAccount.password)
    await page.locator('[data-cy=change-password-submit]').click()

    await expect(page.locator('[data-cy=success-alert]')).toBeVisible()
    await page.locator('[data-cy="pokračovať-do-konta-button"]').click()
    await expect(page).toHaveURL(/\/$/)
  })
})

/** Cypress: RF01 `registration.cy.ts` — `7. Logout user`; RF02 `registrationPO.cy.ts` — `8. Logout user`. */
test('signing out', { tag: '@legacy' }, async ({ page, registeredAccount }) => {
  void registeredAccount
  await logOut(page)
})
