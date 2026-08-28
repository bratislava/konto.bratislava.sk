import { expect, test } from '../../fixtures'
import {
  expectRegistrationSuccess,
  logIn,
  logOut,
  openProfile,
  submitForm,
} from '../../pages/AccountPage'
import { waitForHydration } from '../../pages/FormPage'

/**
 * Was `tests/cypress/e2e/registration/registration.cy.ts` (RF01) and `registrationPO.cy.ts` (RF02),
 * plus the nested `A02 - change email and password` block.
 *
 * Each test registers its own account, so nothing is shared and they run in parallel — see
 * `src/fixtures/identity.ts` for why `Date.now()`-based addresses could not.
 */

// Registration must start signed out; do not rely on the default.
test.use({ storageState: { cookies: [], origins: [] } })

test('registrácia fyzickej osoby', async ({ page, identity }) => {
  await page.goto('/registracia')
  await waitForHydration(page)

  await test.step('prázdny formulár sa neodošle a označí chyby', async () => {
    await submitForm(page, 'register-form', { turnstile: true })

    // The Cypress version asserted `[aria-required=true]` had exactly 5 elements — a magic number
    // that says nothing about which field is required.
    await expect(page.locator('[data-cy=error-message]').first()).toBeVisible()
    await expect(page).toHaveURL(/\/registracia/)
  })

  await test.step('vyplnenie a odoslanie', async () => {
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

test('registrácia právnickej osoby', async ({ page, identity }) => {
  await page.goto('/registracia')
  await waitForHydration(page)

  const form = page.locator('[data-cy=register-form]')
  await form.locator('[data-cy="radio-právnická-osoba"]').click()

  await form.locator('[data-cy=input-email]').fill(identity.email)
  await form.locator('[data-cy=input-name]').fill(identity.companyName)
  await form.locator('[data-cy=input-password]').fill(identity.password)

  await submitForm(page, 'register-form', { turnstile: true })
  await expectRegistrationSuccess(page, identity.email)
})

/**
 * The Cypress A02 block ran as five chained `it`s inside the registration describe, reusing the
 * account it had just created. It is genuinely sequential, so it stays one test with steps — but it
 * now owns its account instead of depending on another spec having run first.
 */
test('zmena e-mailu a hesla', async ({ page, registeredAccount }) => {
  // Registration here is setup, not the thing under test, so it goes through the shared helper.
  await logOut(page)
  await logIn(page, registeredAccount.email, registeredAccount.password)

  await test.step('zmena e-mailu', async () => {
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

  await test.step('zmena hesla', async () => {
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

/** Was the trailing `cy.logOutUser()` in every account spec; real coverage, so it gets its own test. */
test('odhlásenie', async ({ page, registeredAccount }) => {
  void registeredAccount
  await logOut(page)
})
