import { expect, test } from '../../fixtures'
import { continueToAccount, openProfile } from '../../pages/AccountPage'

/**
 * The profile page of a freshly registered account: the unverified-identity alert, the GDPR consent
 * toggle and the name change.
 *
 *
 * Cypress sources:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/account/consentsVerification.cy.ts
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/account/personalData.cy.ts
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/account/unverifiedProfile.cy.ts
 */

test.beforeEach(async ({ page, registeredAccount }) => {
  // `registeredAccount` leaves us on the post-registration success screen, already signed in.
  void registeredAccount
  await continueToAccount(page)
  await openProfile(page)
})

/** Cypress: A05 `unverifiedProfile.cy.ts` — `it` 1–3. */
test(
  'unverified account shows an alert and links to identity verification',
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

/** Cypress: A03 `consentsVerification.cy.ts` — `it` 1–3. */
test('marketing consent can be revoked and granted again', { tag: '@legacy' }, async ({ page }) => {
  const consent = page.locator('[data-cy=receive-information-consent]')
  const toggle = consent.locator('[data-cy=receive-information-toggle]')
  const input = toggle.locator('input')

  const gdprRequest = () =>
    page.waitForRequest(
      (request) => request.url().includes('/user/gdpr-consent') && request.method() === 'POST',
    )

  // A freshly registered account has this consent granted.
  await expect(input).toBeChecked()

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
})

/** Cypress: A04 `personalData.cy.ts` — `it` 1–3. */
test(
  'first and last name changes are saved',
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
