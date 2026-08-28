import { expect, test } from '../../../fixtures'
import { continueToAccount, openProfile } from '../../../pages/AccountPage'

/**
 * Merges `consentsVerification.cy.ts` (A03), `personalData.cy.ts` (A04) and
 * `unverifiedProfile.cy.ts` (A05).
 *
 * All three signed into one shared staging account in Cypress, and two of them mutated it: A03
 * flipped a server-side GDPR consent, A04 permanently renamed it. That made them the last piece of
 * shared mutable state in the suite — they had to run serially, under a single project, and they
 * left the account dirty for the next run.
 *
 * Each test now registers its own account instead (`registeredAccount`), so they are fully
 * independent: parallel, both viewports, no ordering, no leftover state, and no credentials in git.
 * A freshly registered account is also exactly the state A05 wants — unverified against the state
 * registers — and unlike the shared one it cannot accidentally become verified.
 */
test.use({ storageState: { cookies: [], origins: [] } })

test.beforeEach(async ({ page, registeredAccount }) => {
  // `registeredAccount` leaves us on the post-registration success screen, already signed in.
  void registeredAccount
  await continueToAccount(page)
  await openProfile(page)
})

test(
  'neoverený používateľ vidí upozornenie a prejde na overenie identity',
  { tag: '@legacy' },
  async ({ page }) => {
    const alert = page.locator('[data-cy=alert-container]').first()
    await expect(alert).toBeVisible()
    await expect(alert.locator('[data-cy=alert-container-title]')).toContainText(
      'Neoverený používateľ',
    )

    await page.locator('[data-cy=alert-container-button]').first().click()
    await expect(page).toHaveURL(/\/overenie-identity/)
  },
)

test(
  'súhlas so zasielaním informácií sa dá zapnúť a vypnúť',
  { tag: '@legacy' },
  async ({ page }) => {
    const consent = page.locator('[data-cy=receive-information-consent]')
    const toggle = consent.locator('[data-cy=receive-information-toggle]')
    const input = toggle.locator('input')

    const gdprRequest = () =>
      page.waitForRequest(
        (request) => request.url().includes('/user/gdpr-consent') && request.method() === 'POST',
      )

    // A freshly registered account has this consent granted, so the sequence is revoke-then-grant.
    // The Cypress version was the other way round only because it ran on a long-lived shared account
    // that the previous run had left revoked.
    await expect(input).toBeChecked()

    // Cypress asserted the request body, which is the part that proves the app sends the right
    // payload rather than merely firing a request.
    const revoking = gdprRequest()
    await toggle.click()
    expect(JSON.parse((await revoking).postData() ?? '{}')).toMatchObject({ grant: false })
    await expect(input).not.toBeChecked()

    // The change must survive a reload — that is what proves it was persisted server-side.
    await page.reload()
    await expect(input).not.toBeChecked()

    const granting = gdprRequest()
    await toggle.click()
    expect(JSON.parse((await granting).postData() ?? '{}')).toMatchObject({ grant: true })
    await expect(input).toBeChecked()
  },
)

test(
  'zmena mena a priezviska sa uloží',
  { tag: '@legacy' },
  async ({ page, registeredAccount }) => {
    const meno = `Zmenene${registeredAccount.email.split('@')[0].slice(-6)}`
    const priezvisko = `Priezvisko${registeredAccount.email.split('@')[0].slice(-6)}`

    await page.locator('[data-cy=edit-personal-information-button]').click()

    const form = page.locator('[data-cy=edit-personal-information-form-container]')
    await form.locator('[data-cy=input-given_name]').fill(meno)
    await form.locator('[data-cy=input-family_name]').fill(priezvisko)

    const saved = page.waitForResponse((response) =>
      response.url().includes('/user/update-or-create-bloomreach-customer'),
    )
    await page.locator('[data-cy=save-personal-information-button]').click()
    await saved

    await page.reload()
    await expect(page.locator('[data-cy=meno-a-priezvisko-profile-row]')).toContainText(
      `${meno} ${priezvisko}`,
    )
  },
)
