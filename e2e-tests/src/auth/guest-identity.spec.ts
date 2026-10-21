import { BASE_URL } from '../../playwright.config'
import { expect, test } from '../legacy/fixtures'
import { continueToAccount, logIn, logOut, registerAccount } from '../legacy/pages/AccountPage'
import {
  collectConsoleMessages,
  endSessionWithoutSignOut,
  expectHealedIdentityCookie,
  expectNoIdentityCookie,
  expectSignedIn,
  expectSignedOut,
  expectUsableGuestIdentity,
  getDeletionHeaders,
  getGuestIdentityStatus,
  getTokenCookieNames,
  navigateClientSideToMunicipalServices,
  nonexistentIdentityId,
  regionOf,
  requireIdentityCookie,
  setIdentityCookie,
  trackDocumentRequests,
} from './guest-identity'

/**
 * The guest identity ID Amplify keeps in a cookie, and what the app does with it on top of Amplify:
 *
 * - `amplifyGetServerSideProps` heals a cookie that Cognito rejects (a deleted, malformed or user-linked identity) in
 *   the same response. Amplify itself throws on every request then: https://github.com/aws-amplify/amplify-js/issues/14975
 * - `AmplifyClientProvider` logs the guest identity ID with the user at every sign-in.
 *
 * It also guards the upstream fix the app relies on: Amplify deleting the cookie on the server with `Path=/`, so that
 * the deletion works on `/_next/data` requests too: https://github.com/aws-amplify/amplify-js/issues/14974
 *
 * Cookie handling does not depend on the viewport, so these are tagged `@desktop-only`.
 */

const unusableValues = [
  { label: 'an identity that does not exist', create: nonexistentIdentityId },
  { label: 'a malformed value', create: () => 'not-an-identity-id' },
]

test.describe('as a guest', () => {
  for (const { label, create } of unusableValues) {
    test(
      `heals an identityId cookie holding ${label} on a full page load`,
      { tag: ['@auth', '@desktop-only'] },
      async ({ page, context }) => {
        await page.goto('/')
        const guest = await requireIdentityCookie(context)
        const unusable = create(regionOf(guest.value))
        await setIdentityCookie(context, guest.name, unusable)
        await context.addCookies([{ name: 'unrelated', value: 'kept', url: BASE_URL }])
        await page.evaluate(() => localStorage.setItem('unrelated', 'kept'))
        const documentRequests = trackDocumentRequests(page)

        const response = await page.goto('/')

        expect(response?.status()).toBe(200)
        await expectSignedOut(page)
        await expectHealedIdentityCookie(context, unusable)
        expect(documentRequests, 'healed without a reload').toHaveLength(1)
        expect(
          (await context.cookies(BASE_URL)).find((cookie) => cookie.name === 'unrelated')?.value,
        ).toBe('kept')
        expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe('kept')
      },
    )

    test(
      `heals an identityId cookie holding ${label} on a client-side navigation`,
      { tag: ['@auth', '@desktop-only'] },
      async ({ page, context }) => {
        await page.goto('/')
        const guest = await requireIdentityCookie(context)
        const unusable = create(regionOf(guest.value))
        await setIdentityCookie(context, guest.name, unusable)
        const documentRequests = trackDocumentRequests(page)

        const dataResponse = await navigateClientSideToMunicipalServices(page)

        expect(dataResponse.status()).toBe(200)
        await expectHealedIdentityCookie(context, unusable)
        expect(documentRequests, 'no document request').toHaveLength(0)
      },
    )
  }
})

test.describe('signing in', () => {
  /**
   * Registration signs in with Amplify's auto sign-in, the sign-in page with `signIn`. After both, no guest identityId
   * cookie may be left: Amplify links the guest identity to the user on its first credentials request, after which a
   * leftover cookie would fail every request once the session ends.
   */
  test(
    'leaves no guest identityId cookie behind, and logs it with the user',
    { tag: ['@auth', '@desktop-only'] },
    async ({ page, context, identity }) => {
      // Registers, signs out and signs in: three sequential Cognito round-trips, one behind Turnstile.
      test.slow()
      const consoleMessages = collectConsoleMessages(page)
      const expectSignInLog = (guestIdentityId: string) =>
        expect(consoleMessages).toContainEqual(
          expect.stringMatching(
            new RegExp(
              `^\\[AUTH\\] Signed in user \\S+ with guest identity ID ${guestIdentityId}$`,
            ),
          ),
        )

      await test.step('register', async () => {
        await page.goto('/registracia')
        const guest = await requireIdentityCookie(context)

        await registerAccount(page, identity)

        await expectNoIdentityCookie(context)
        expectSignInLog(guest.value)
      })

      await test.step('sign out', async () => {
        await continueToAccount(page)
        await logOut(page)

        await expectUsableGuestIdentity((await requireIdentityCookie(context)).value)
      })

      await test.step('sign in', async () => {
        await page.goto('/prihlasenie')
        const guest = await requireIdentityCookie(context)

        await logIn(page, identity.email, identity.password)

        await expectNoIdentityCookie(context)
        expectSignInLog(guest.value)
      })
    },
  )
})

test.describe('signed in', () => {
  test(
    'removes and heals identityId cookies left in the session',
    { tag: ['@auth', '@desktop-only'] },
    async ({ page, context, identity }) => {
      // Registration alone takes six sequential staging round-trips.
      test.slow()

      await page.goto('/registracia')
      const guest = await requireIdentityCookie(context)
      await registerAccount(page, identity)
      await continueToAccount(page)
      await expectSignedIn(page)

      await test.step('an unusable cookie heals and the user stays signed in', async () => {
        const tokenCookies = await getTokenCookieNames(context)
        await setIdentityCookie(context, guest.name, nonexistentIdentityId(regionOf(guest.value)))

        const response = await page.goto('/')

        expect(response?.status()).toBe(200)
        await expectSignedIn(page)
        await expectNoIdentityCookie(context)
        expect(await getTokenCookieNames(context), 'token cookies are kept').toEqual(tokenCookies)
      })

      // A guest response still in flight at sign-in can write the guest cookie back.
      await test.step('a guest cookie written back is removed on a client-side navigation', async () => {
        await setIdentityCookie(context, guest.name, guest.value)

        const dataResponse = await navigateClientSideToMunicipalServices(page)

        // Fails with @aws-amplify/adapter-nextjs < 1.8.1 or aws-amplify < 6.22.2, which delete without `Path`.
        expect(await getDeletionHeaders(dataResponse, guest.name)).toContainEqual(
          expect.stringMatching(/;\s*Path=\/(;|$)/i),
        )
        await expectNoIdentityCookie(context)
        expect(
          await getGuestIdentityStatus(guest.value),
          'the guest identity is linked to the user',
        ).toBe('NotAuthorizedException')
      })

      await test.step('a linked cookie left behind when the session ends heals', async () => {
        await setIdentityCookie(context, guest.name, guest.value)
        await endSessionWithoutSignOut(context)
        const documentRequests = trackDocumentRequests(page)

        const response = await page.goto('/')

        expect(response?.status()).toBe(200)
        await expectSignedOut(page)
        await expectHealedIdentityCookie(context, guest.value)
        expect(documentRequests, 'healed without a reload').toHaveLength(1)
      })
    },
  )
})
