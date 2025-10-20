import type { NextApiRequest, NextApiResponse } from 'next'
import { signOut } from 'aws-amplify/auth/server'
import { baRunWithAmplifyServerContext } from '../../../frontend/utils/amplifyServerRunner'
import logger from '../../../frontend/utils/logger'

/**
 * OAuth Logout Endpoint
 *
 * Logs out the user from Amplify/Cognito and redirects to specified logout URI.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { client_id, logout_uri, state } = req.query

    // Validate client_id if provided
    if (client_id) {
      const validClientIds = [
        process.env.OAUTH_DPB_CLIENT_ID,
        process.env.OAUTH_MPA_CLIENT_ID,
      ].filter(Boolean)

      if (!validClientIds.includes(client_id as string)) {
        return res.status(400).json({
          error: 'invalid_client',
          error_description: 'Invalid client_id',
        })
      }
    }

    // Sign out from Cognito
    await baRunWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        try {
          await signOut(contextSpec)
          logger.info('[OAuth] User signed out successfully')
        } catch (error) {
          logger.error('[OAuth] Sign out error', error)
          // Continue with redirect even if sign out fails
        }
      },
    })

    // Determine redirect URI
    let redirectUri = logout_uri as string

    // Validate logout_uri if client_id is provided
    if (client_id && logout_uri) {
      const allowedUris = getPartnerRedirectUris(client_id as string)
      if (!allowedUris.includes(logout_uri as string)) {
        logger.warn(`[OAuth] Logout URI ${logout_uri} not allowed for client ${client_id}`)
        redirectUri = undefined
      }
    }

    // Default to home page if no valid redirect URI
    if (!redirectUri) {
      redirectUri = '/'
    }

    // Append state if provided
    if (state && redirectUri) {
      const separator = redirectUri.includes('?') ? '&' : '?'
      redirectUri = `${redirectUri}${separator}state=${encodeURIComponent(state as string)}`
    }

    logger.info(`[OAuth] Redirecting to logout URI: ${redirectUri}`)
    return res.redirect(302, redirectUri)
  } catch (error) {
    logger.error('[OAuth] Logout endpoint error', error)
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    })
  }
}

function getPartnerRedirectUris(clientId: string): string[] {
  if (clientId === process.env.OAUTH_DPB_CLIENT_ID) {
    return (process.env.OAUTH_DPB_REDIRECT_URIS || '').split(',').map((uri) => uri.trim())
  }
  if (clientId === process.env.OAUTH_MPA_CLIENT_ID) {
    return (process.env.OAUTH_MPA_REDIRECT_URIS || '').split(',').map((uri) => uri.trim())
  }
  return []
}
