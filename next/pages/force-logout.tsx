import logger from 'frontend/utils/logger'
import { useEffectOnce } from 'usehooks-ts'

import { removeAllCookiesAndClearLocalStorage, useSignOut } from '../frontend/utils/amplifyClient'

const ForceLogoutPage = () => {
  const { signOut } = useSignOut()

  const logoutHandler = async () => {
    try {
      logger.error(`[AUTH] Forced sign out`)
      // give a short moment to show the user what is happening
      await new Promise((resolve) => {
        setTimeout(resolve, 2000)
      })
      // clearing BEFORE signing out, to make sure it happens (singOut redirects)
      removeAllCookiesAndClearLocalStorage()
      // shouldn't be needed, but to be sure that we clear also the in-memory session
      // in worst case this throws, which is fine - we still cleared everything on the previous line
      await signOut()
    } catch (error) {
      logger.error('[AUTH] Error during forced sign out - redirecting to login', error)
      // this also causes the app to reload, clearing any in memory state if signOut failed
      window.location.replace('/prihlasenie')
    }
  }

  useEffectOnce(() => {
    logoutHandler().catch((error) => {
      logger.error('Unexpected error when forcing logout - this should never happen', error)
    })
  })

  return 'Neočakávaná chyba, prosím znovu sa prihláste.'
}

export default ForceLogoutPage
