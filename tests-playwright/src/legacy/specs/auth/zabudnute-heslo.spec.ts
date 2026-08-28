import { expect, test } from '../../fixtures'
import { submitForm } from '../../pages/AccountPage'
import { waitForHydration } from '../../pages/FormPage'

/**
 * Was the nested `RF05 - forgotten password` block in `tests/cypress/e2e/registration/registration.cy.ts`.
 *
 * The Cognito mock is kept deliberately. The Cypress comment explains why: real calls to
 * `ForgotPassword` are throttled per user and the tests were failing intermittently with
 * `LimitExceededException`. `page.route` is the direct equivalent of `cy.intercept`.
 */
test.use({ storageState: { cookies: [], origins: [] } })

const COGNITO_URL = /^https:\/\/cognito-idp\.[a-z0-9-]+\.amazonaws\.com\/$/
const FORGOT_PASSWORD_TARGET = 'AWSCognitoIdentityProviderService.ForgotPassword'

test.describe('zabudnuté heslo', () => {
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

  test('neplatný formát e-mailu je odmietnutý', { tag: '@legacy' }, async ({ page }) => {
    await page.locator('[data-cy=forgotten-password-form] [data-cy=input-email]').fill('test')
    await submitForm(page, 'forgotten-password-form')

    await expect(page.locator('[data-cy=error-message]').first()).toBeVisible()
  })

  test('neznámy e-mail zobrazí chybu', { tag: '@legacy' }, async ({ page, identity }) => {
    await page
      .locator('[data-cy=forgotten-password-form] [data-cy=input-email]')
      .fill(identity.unknownEmail)
    await submitForm(page, 'forgotten-password-form')

    await expect(page.locator('[data-cy=alert-container]').first()).toBeVisible()
    await expect(page.locator('[data-cy=forgotten-password-form]')).toBeVisible()
  })

  test(
    'známy e-mail pokračuje na zadanie nového hesla',
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
