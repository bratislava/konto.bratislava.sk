import { Auth } from 'aws-amplify'
import { ROUTES } from 'frontend/api/constants'

import logger from './logger'

export const getAccessTokenOrLogout = async () => {
  try {
    const session = await Auth.currentSession()
    const jwtToken = session.getAccessToken().getJwtToken()
    if (!jwtToken) throw new Error('no jwt token found in current session')
    return jwtToken
  } catch (error) {
    logger.error('error getting access token - redirect to login', error)
    window.location.assign(ROUTES.LOGIN)
    throw error
  }
}

// Auth.getCurrentAuthenticatedUser throws when not authenticated
// this helper changes that - note that it ignores any other potential errors
export const getCurrentAuthenticatedUser = async (): Promise<
  ReturnType<typeof Auth.currentAuthenticatedUser>
> => {
  try {
    // shoud get fixed with v6 amplify typing
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Auth.currentAuthenticatedUser()
  } catch (error) {
    return null
  }
}
