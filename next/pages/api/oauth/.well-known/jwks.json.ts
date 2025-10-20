import type { NextApiRequest, NextApiResponse } from 'next'
import logger from '../../../../frontend/utils/logger'

/**
 * JWKS (JSON Web Key Set) Endpoint
 *
 * Returns the public keys used to verify JWT signatures.
 * Proxies to Cognito's JWKS endpoint.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const cognitoRegion = process.env.AWS_COGNITO_REGION
    const cognitoUserPoolId = process.env.AWS_COGNITO_USERPOOL_ID
    const jwksUrl = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}/.well-known/jwks.json`

    logger.info('[OAuth] JWKS request, fetching from Cognito')

    const response = await fetch(jwksUrl)
    const data = await response.json()

    if (!response.ok) {
      logger.error('[OAuth] JWKS fetch failed', { status: response.status, data })
      return res.status(response.status).json(data)
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    return res.status(200).json(data)
  } catch (error) {
    logger.error('[OAuth] JWKS endpoint error', error)
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    })
  }
}
