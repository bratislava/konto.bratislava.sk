import type { NextApiRequest, NextApiResponse } from 'next'
import logger from '../../../frontend/utils/logger'

/**
 * OAuth Token Endpoint
 *
 * Proxies token requests to the Nest backend.
 * This endpoint validates client credentials and forwards to nest-city-account.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const backendUrl = process.env.NEST_CITY_ACCOUNT_URL || 'https://nest-city-account.bratislava.sk'
    const tokenUrl = `${backendUrl}/oauth/token`

    // Extract client credentials from Authorization header or body
    let authHeader = req.headers.authorization

    // If not in header, build from body
    if (!authHeader && req.body.client_id && req.body.client_secret) {
      const credentials = Buffer.from(
        `${req.body.client_id}:${req.body.client_secret}`
      ).toString('base64')
      authHeader = `Basic ${credentials}`
    }

    logger.info('[OAuth] Token request received, forwarding to backend')

    // Forward request to Nest backend
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: new URLSearchParams(req.body).toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error('[OAuth] Token request failed', { status: response.status, data })
      return res.status(response.status).json(data)
    }

    logger.info('[OAuth] Token request successful')
    return res.status(200).json(data)
  } catch (error) {
    logger.error('[OAuth] Token endpoint error', error)
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    })
  }
}
