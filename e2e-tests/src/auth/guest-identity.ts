import { randomUUID } from 'node:crypto'

import { type BrowserContext, expect, type Page, type Response } from '@playwright/test'

import { BASE_URL } from '../../playwright.config'

/**
 * Helpers for the guest identity specs.
 *
 * Amplify keeps a guest's Cognito identity ID in a `com.amplify.Cognito.<identityPoolId>.identityId` cookie. The name
 * contains the identity pool ID, so tests read it from a real guest visit instead of building it.
 */

export type IdentityCookie = { name: string; value: string }

export const getIdentityCookie = async (
  context: BrowserContext,
): Promise<IdentityCookie | undefined> =>
  (await context.cookies(BASE_URL)).find((cookie) => cookie.name.endsWith('.identityId'))

/** The guest identityId cookie, which the current page must have set. */
export const requireIdentityCookie = async (context: BrowserContext): Promise<IdentityCookie> => {
  const cookie = await getIdentityCookie(context)
  if (!cookie) {
    throw new Error('Expected a guest identityId cookie, there is none')
  }

  return cookie
}

/** Puts a value into the identityId cookie, the way a stale or broken cookie would be left in the browser. */
export const setIdentityCookie = (context: BrowserContext, name: string, value: string) =>
  context.addCookies([{ name, value, url: BASE_URL }])

/** A well-formed identity ID that Cognito does not know, as after the identity was deleted. */
export const nonexistentIdentityId = (region: string) => `${region}:${randomUUID()}`

export const regionOf = (identityId: string) => identityId.split(':')[0]

/** Removes the user pool token cookies without signing out, as when the refresh token expires or is revoked. */
export const endSessionWithoutSignOut = (context: BrowserContext) =>
  context.clearCookies({ name: /^CognitoIdentityServiceProvider\./ })

export const getTokenCookieNames = async (context: BrowserContext) =>
  (await context.cookies(BASE_URL))
    .filter((cookie) => /\.(accessToken|idToken|refreshToken)$/.test(cookie.name))
    .map((cookie) => cookie.name)
    .sort()

/**
 * Asks Cognito, without credentials, for guest credentials for an identity ID: the call Amplify makes for a guest.
 * Returns `usable`, or Cognito's error type, e.g. `NotAuthorizedException` once the identity is linked to a user.
 */
export const getGuestIdentityStatus = async (identityId: string) => {
  const response = await fetch(`https://cognito-identity.${regionOf(identityId)}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
    },
    body: JSON.stringify({ IdentityId: identityId }),
  })
  if (response.ok) {
    return 'usable'
  }
  const body = (await response.json()) as { __type?: string }

  return body.__type ?? `HTTP ${response.status}`
}

export const expectUsableGuestIdentity = async (identityId: string) => {
  expect(
    await getGuestIdentityStatus(identityId),
    `${identityId} is usable as a guest identity`,
  ).toBe('usable')
}

/** Waits for the identityId cookie to disappear, e.g. after an asynchronous sign-in step. */
export const expectNoIdentityCookie = async (context: BrowserContext) => {
  await expect
    .poll(async () => (await getIdentityCookie(context))?.value, {
      message: 'the guest identityId cookie is removed',
    })
    .toBeUndefined()
}

/**
 * Asserts the page healed an unusable identityId cookie in place: the cookie now holds a different identity that
 * Cognito accepts as a guest.
 */
export const expectHealedIdentityCookie = async (
  context: BrowserContext,
  unusableValue: string,
) => {
  const healed = await requireIdentityCookie(context)
  expect(healed.value, 'the identityId cookie holds a new identity').not.toBe(unusableValue)
  await expectUsableGuestIdentity(healed.value)
}

/**
 * Collects the top-level document requests of a page, to tell a page that healed in the same response from one that
 * had to reload.
 */
export const trackDocumentRequests = (page: Page) => {
  const urls: string[] = []
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      urls.push(request.url())
    }
  })

  return urls
}

export const collectConsoleMessages = (page: Page) => {
  const messages: string[] = []
  page.on('console', (message) => messages.push(message.text()))

  return messages
}

/** The `Set-Cookie` headers of a response that delete the given cookie. */
export const getDeletionHeaders = async (response: Response, cookieName: string) =>
  (await response.headersArray())
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => header.value)
    .filter((value) => value.startsWith(`${cookieName}=;`))

/**
 * Waits until React has started hydrating the page. Before that, clicking a `next/link` is a plain link click, i.e. a
 * full page load instead of a client-side navigation; from then on, React replays the click once it has hydrated the
 * link. React marks the container with an internal `__reactContainer$…` property, the only signal Next.js gives
 * outside its own test mode.
 */
const waitForHydrationStart = (page: Page) =>
  page.waitForFunction(() => {
    const root = document.getElementById('__next')

    return root !== null && Object.keys(root).some((key) => key.startsWith('__reactContainer$'))
  })

/**
 * Client-side navigation through the desktop menu, which `getServerSideProps` serves as a `/_next/data` request.
 *
 * Waits for that response before checking the URL: the page loads a lot of data from Strapi, and the request can take
 * longer than an assertion's default timeout.
 */
export const navigateClientSideToMunicipalServices = async (page: Page) => {
  await waitForHydrationStart(page)
  const dataResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/_next/data/') && response.url().endsWith('/mestske-sluzby.json'),
  )
  await page
    .getByRole('link', { name: 'Mestské služby', exact: true })
    .filter({ visible: true })
    .first()
    .click()
  const response = await dataResponse
  await expect(page).toHaveURL(/\/mestske-sluzby$/)

  return response
}

export const expectSignedIn = (page: Page) =>
  expect(page.locator('[data-cy=account-button]'), 'signed in').toBeVisible()

export const expectSignedOut = (page: Page) =>
  expect(page.locator('[data-cy=register-button]'), 'signed out').toBeVisible()
