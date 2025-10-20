import { fetchAuthSession } from 'aws-amplify/auth/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import { baRunWithAmplifyServerContext } from '../../frontend/utils/amplifyServerRunner'
import logger from '../../frontend/utils/logger'

/**
 * Session Check Endpoint
 *
 * This endpoint is called by the backend to check if a user has an active session.
 * It does NOT contain any OAuth secrets or logic - it's purely a session checker.
 *
 * If user is logged in: Returns a temporary access token
 * If not logged in: Returns no token
 *
 * The backend uses this information to decide whether to enable SSO.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { return_url } = req.query

    if (!return_url || typeof return_url !== 'string') {
      return res.status(400).json({ error: 'Missing return_url parameter' })
    }

    // Validate return_url is from our backend
    const backendUrl = process.env.NEXT_PUBLIC_NEST_CITY_ACCOUNT_URL || 'https://nest-city-account.bratislava.sk'
    if (!return_url.startsWith(backendUrl)) {
      return res.status(400).json({ error: 'Invalid return_url' })
    }

    // Check if user is authenticated using Amplify server context
    const sessionInfo = await baRunWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec)
          
          if (session.tokens?.accessToken) {
            logger.info('[Session Check] User is authenticated')
            return {
              authenticated: true,
              accessToken: session.tokens.accessToken.toString(),
            }
          }
          
          logger.info('[Session Check] User is not authenticated')
          return {
            authenticated: false,
            accessToken: null,
          }
        } catch (error) {
          logger.error('[Session Check] Failed to fetch auth session', error)
          return {
            authenticated: false,
            accessToken: null,
          }
        }
      },
    })

    // Build return URL with session info
    const returnUrl = new URL(return_url)
    
    if (sessionInfo.authenticated && sessionInfo.accessToken) {
      // User is logged in - pass access token to backend
      // Note: We use 'access_token' as the parameter name to match what
      // the login page already does for remote redirects
      returnUrl.searchParams.set('access_token', sessionInfo.accessToken)
    }
    // If not authenticated, just redirect without token

    // Redirect back to backend
    logger.info(`[Session Check] Redirecting back to: ${returnUrl.toString()}`)
    return res.redirect(302, returnUrl.toString())
  } catch (error) {
    logger.error('[Session Check] Error', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
