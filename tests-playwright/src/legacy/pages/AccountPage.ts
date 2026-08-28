import { expect, type Page } from '@playwright/test'

import { waitForHydration } from './FormPage'

export const logIn = async (page: Page, email: string, password: string) => {
  await page.goto('/prihlasenie')
  await waitForHydration(page)

  const form = page.locator('[data-cy=login-container]')
  await form.locator('[data-cy=input-email]').fill(email)
  await form.locator('[data-cy=input-password]').fill(password)
  await form.locator('[data-cy=login-button]').click()

  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
}

export const logOut = async (page: Page) => {
  await page.goto('/odhlasenie')
  await waitForHydration(page)
  await page.locator('[data-cy="odhlásiť-sa-button"]').click()
  await expect(page).toHaveURL(/\/prihlasenie/)
}

/**
 * Opens the profile via the account menu, which differs between viewports: the desktop navbar has
 * `account-button`, the mobile one `mobile-account-button`. Picking the visible one keeps the spec
 * viewport-agnostic instead of branching on a `device` string the way every Cypress spec did.
 */
export const openProfile = async (page: Page) => {
  await page
    .locator('[data-cy=account-button], [data-cy=mobile-account-button]')
    .locator('visible=true')
    .first()
    .click()
  await page.locator('[data-cy=moj-profil-menu-item]').click()
  await expect(page).toHaveURL(/\/moj-profil/)
}

/**
 * Waits for Cloudflare Turnstile to produce a token, when the form uses it.
 *
 * `RegisterForm` declares `turnstileToken` as a *required* schema field, so submitting before the
 * widget has resolved fails validation silently — the form simply does not advance. This is what
 * the Cypress `.dblclick()` was really working around: the first click was swallowed and the second
 * happened to land after the token arrived.
 *
 * The e2e build uses Cloudflare's always-pass test key, so the token appears in a second or two,
 * but it is still asynchronous and must be waited for rather than double-clicked through.
 */
const waitForTurnstile = async (page: Page) => {
  // Waits for the hidden input to both exist and hold a token. Checking `count()` first and
  // returning early is not enough — the input is injected by Cloudflare's script, so it is often
  // still absent when the form has just been filled, and skipping the wait means submitting
  // without a token.
  await page.waitForFunction(
    () =>
      Boolean(
        (document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null)
          ?.value,
      ),
    undefined,
    { timeout: 30_000 },
  )
}

/**
 * Submits a form by its container's `data-cy`, once — never a double click.
 *
 * `turnstile` is explicit rather than detected: only `RegisterForm` and the identity-verification
 * form use the captcha, and a heuristic that guessed wrong would either hang on forms without it or
 * silently submit too early on forms with it.
 */
export const submitForm = async (
  page: Page,
  formDataCy: string,
  { turnstile = false }: { turnstile?: boolean } = {},
) => {
  await waitForHydration(page)
  if (turnstile) {
    await waitForTurnstile(page)
  }
  await page.locator(`[data-cy=${formDataCy}] button[type=submit]`).click()
}

/**
 * The success screen shown after registration or an e-mail change.
 *
 * Named `check2FAPage` in Cypress, which is misleading for this environment: the staging pool
 * auto-confirms the `cypress.test` domain, so `signUp` returns `UserConfirmed: true` and Amplify
 * completes `autoSignIn` — the user is signed in, never asked for a code.
 *
 * The generous timeout is not padding. Getting here costs six sequential staging round-trips:
 * SignUp, InitiateAuth, RespondToAuthChallenge, GetCredentialsForIdentity, the forms-backend
 * migration prep, and the city-account user upsert. Cypress allowed 15s and that is simply too
 * tight when several tests hit staging at once.
 */
export const expectRegistrationSuccess = async (page: Page, email: string) => {
  await expect(page.locator('[data-cy=success-alert]')).toContainText(email, { timeout: 60_000 })
  await expect(page.locator('[data-cy="pokračovať-do-konta-button"]')).toContainText(
    'Pokračovať do konta',
  )
}

export type AccountType = 'fyzickaOsoba' | 'pravnickaOsoba'

/**
 * Registers a brand-new account through the UI and leaves it signed in.
 *
 * Registration is the cheapest way to get an isolated account, which is why nothing in this suite
 * needs a shared one any more:
 *  - the staging pool auto-confirms the `cypress.test` domain, so `signUp` returns
 *    `UserConfirmed: true` with no `CodeDeliveryDetails` — **no verification e-mail is sent**, so
 *    this does not consume Cognito's e-mail quota;
 *  - Amplify's `autoSignIn` completes immediately, so the caller is already authenticated;
 *  - the account is unverified against the state registers, which is exactly the state the profile
 *    specs assert.
 *
 * Used for setup only. The registration specs themselves fill the form inline, because there the
 * form *is* the thing under test.
 */
export const registerAccount = async (
  page: Page,
  identity: {
    email: string
    password: string
    givenName: string
    familyName: string
    companyName: string
  },
  { accountType = 'fyzickaOsoba' }: { accountType?: AccountType } = {},
) => {
  await page.goto('/registracia')
  await waitForHydration(page)

  const form = page.locator('[data-cy=register-form]')

  if (accountType === 'pravnickaOsoba') {
    await form.locator('[data-cy="radio-právnická-osoba"]').click()
    await form.locator('[data-cy=input-email]').fill(identity.email)
    await form.locator('[data-cy=input-name]').fill(identity.companyName)
  } else {
    await form.locator('[data-cy=input-email]').fill(identity.email)
    await form.locator('[data-cy=input-given_name]').fill(identity.givenName)
    await form.locator('[data-cy=input-family_name]').fill(identity.familyName)
  }

  await form.locator('[data-cy=input-password]').fill(identity.password)
  await submitForm(page, 'register-form', { turnstile: true })
  await expectRegistrationSuccess(page, identity.email)
}

/** Leaves the post-registration success screen for the signed-in home page. */
export const continueToAccount = async (page: Page) => {
  await page.locator('[data-cy="pokračovať-do-konta-button"]').click()
  await expect(page).toHaveURL(/\/$/)
}
