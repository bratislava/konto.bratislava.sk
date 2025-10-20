import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useSignOut } from '../frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(
  async () => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: false },
)

/**
 * OAuth Logout Handler
 *
 * This page is called by the backend when an OAuth logout is requested.
 * It signs out the user from Amplify and redirects to the specified logout URI.
 *
 * Query parameters:
 * - logout_uri: Where to redirect after logout
 * - state: OAuth state parameter to preserve
 */
const OAuthLogoutPage = () => {
  const router = useRouter()
  const { signOut } = useSignOut()
  const { logout_uri, state } = router.query

  useEffect(() => {
    const handleLogout = async () => {
      try {
        logger.info('[OAuth Logout] Signing out user')
        await signOut()
        logger.info('[OAuth Logout] Sign out successful')

        // Redirect to logout URI or home page
        let redirectUrl = logout_uri as string
        if (!redirectUrl) {
          redirectUrl = '/'
        }

        // Append state if provided
        if (state) {
          const separator = redirectUrl.includes('?') ? '&' : '?'
          redirectUrl = `${redirectUrl}${separator}state=${encodeURIComponent(state as string)}`
        }

        logger.info(`[OAuth Logout] Redirecting to: ${redirectUrl}`)
        // Note: logout_uri is validated by backend against allowed redirect URIs
        // Safe to use window.location for external partner URLs
        // eslint-disable-next-line xss/no-location-href-assign
        window.location.href = redirectUrl
      } catch (error) {
        logger.error('[OAuth Logout] Error during logout', error)
        // Redirect anyway
        const fallbackUrl = (logout_uri as string) || '/'
        // eslint-disable-next-line xss/no-location-href-assign
        window.location.href = fallbackUrl
      }
    }

    handleLogout()
  }, [logout_uri, state, signOut])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Odhlasovanie...</h1>
      <p>Budete presmerovaní...</p>
    </div>
  )
}

export default SsrAuthProviderHOC(OAuthLogoutPage)
