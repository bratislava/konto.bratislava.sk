import { expect, test } from '../../fixtures'
import { expectFieldErrors, submitForm } from '../../pages/AccountPage'
import { waitForHydration } from '../../pages/FormPage'

/**
 * The forgotten-password form, against a mocked Cognito.
 *
 * The mock is deliberate: real `ForgotPassword` calls are throttled per user, and hitting the live
 * endpoint makes these tests fail intermittently with `LimitExceededException`.
 *
 * Cypress source:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/registration/registration.cy.ts
 */
test.use({ storageState: { cookies: [], origins: [] } })

const COGNITO_URL = /^https:\/\/cognito-idp\.[a-z0-9-]+\.amazonaws\.com\/$/
const FORGOT_PASSWORD_TARGET = 'AWSCognitoIdentityProviderService.ForgotPassword'

test.describe('forgotten password', () => {
  test.beforeEach(async ({ page, identity }) => {
    await page.route(COGNITO_URL, async (route) => {
      const request = route.request()
      if (
        request.method() !== 'POST' ||
        request.headers()['x-amz-target'] !== FORGOT_PASSWORD_TARGET
      ) {
        return route.fallback()
      }

      const username = JSON.parse(request.postData() ?? '{}').Username as string

      if (username === identity.unknownEmail) {
        return route.fulfill({
          status: 400,
          contentType: 'application/x-amz-json-1.1',
          body: JSON.stringify({
            __type: 'UserNotFoundException',
            message: 'Username/client id combination not found.',
          }),
        })
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/x-amz-json-1.1',
        body: JSON.stringify({
          CodeDeliveryDetails: {
            AttributeName: 'email',
            DeliveryMedium: 'EMAIL',
            Destination: `${username[0]}***@c***`,
          },
        }),
      })
    })

    await page.goto('/zabudnute-heslo')
    await waitForHydration(page)
  })

  /** Cypress: RF05 `registration.cy.ts` — `1. Submitting wrong value`. */
  test('invalid e-mail format is rejected', { tag: '@legacy' }, async ({ page }) => {
    await page.locator('[data-cy=forgotten-password-form] [data-cy=input-email]').fill('test')
    await submitForm(page, 'forgotten-password-form')

    await expectFieldErrors(page, 'forgotten-password-form', ['email'])
  })

  /** Cypress: RF05 `registration.cy.ts` — `2. Submitting wrong email`. */
  test('unknown e-mail shows an error', { tag: '@legacy' }, async ({ page, identity }) => {
    await page
      .locator('[data-cy=forgotten-password-form] [data-cy=input-email]')
      .fill(identity.unknownEmail)
    await submitForm(page, 'forgotten-password-form')

    await expect(page.locator('[data-cy=alert-container]').first()).toBeVisible()
    await expect(page.locator('[data-cy=forgotten-password-form]')).toBeVisible()
  })

  /** Cypress: RF05 `registration.cy.ts` — `3. Submitting correct email`. */
  test(
    'known e-mail continues to the new password step',
    { tag: '@legacy' },
    async ({ page, identity }) => {
      await page
        .locator('[data-cy=forgotten-password-form] [data-cy=input-email]')
        .fill(identity.email)
      await submitForm(page, 'forgotten-password-form')

      await expect(page.locator('[data-cy=new-password-form]')).toBeVisible()
    },
  )
})
