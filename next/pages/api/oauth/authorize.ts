import { fetchAuthSession } from 'aws-amplify/auth/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import { baRunWithAmplifyServerContext } from '../../../frontend/utils/amplifyServerRunner'
import logger from '../../../frontend/utils/logger'

/**
 * OAuth Authorization Endpoint (SSO-enabled)
 *
 * This endpoint runs on konto.bratislava.sk so it has access to Amplify cookies.
 * It checks if user is authenticated and:
 * - If YES: Redirects to Cognito with the user's session (SSO)
 * - If NO: Redirects to /prihlasenie with return URL
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
      nonce,
    } = req.query

    // Validate required parameters
    if (!response_type || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters: response_type, client_id, redirect_uri',
      })
    }

    // Validate partner client_id
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

    // Check if user is authenticated using Amplify server context
    const isAuthenticated = await baRunWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec)
          return Boolean(session.tokens)
        } catch (error) {
          logger.error('[OAuth] Failed to fetch auth session', error)
          return false
        }
      },
    })

    logger.info(
      `[OAuth] Authorization request for client ${client_id}, authenticated: ${isAuthenticated}`
    )

    // Build Cognito authorization URL
    const cognitoRegion = process.env.AWS_COGNITO_REGION
    const cognitoUserPoolId = process.env.AWS_COGNITO_USERPOOL_ID
    const cognitoDomain =
      process.env.OAUTH_COGNITO_DOMAIN ||
      `https://${cognitoUserPoolId}.auth.${cognitoRegion}.amazoncognito.com`

    const params = new URLSearchParams({
      response_type: response_type as string,
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      scope: (scope as string) || 'openid profile email',
    })

    if (state) params.append('state', state as string)
    if (code_challenge) params.append('code_challenge', code_challenge as string)
    if (code_challenge_method)
      params.append('code_challenge_method', code_challenge_method as string)
    if (nonce) params.append('nonce', nonce as string)

    if (isAuthenticated) {
      // User is authenticated - redirect to Cognito for SSO
      const authorizeUrl = `${cognitoDomain}/oauth2/authorize?${params.toString()}`
      logger.info(`[OAuth] SSO: Redirecting to Cognito for client ${client_id}`)
      return res.redirect(302, authorizeUrl)
    }

    // User is not authenticated - redirect to login page
    const currentUrl = `${req.url}`
    const loginUrl = `/prihlasenie?redirect=${encodeURIComponent(currentUrl)}`
    logger.info(`[OAuth] Not authenticated: Redirecting to login for client ${client_id}`)
    return res.redirect(302, loginUrl)
  } catch (error) {
    logger.error('[OAuth] Authorization endpoint error', error)
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    })
  }
}
