import type { NextApiRequest, NextApiResponse } from 'next'
import logger from '../../../frontend/utils/logger'

/**
 * OAuth UserInfo Endpoint
 *
 * Proxies userinfo requests to the Nest backend.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Bearer token is required',
      })
    }

    const backendUrl = process.env.NEST_CITY_ACCOUNT_URL || 'https://nest-city-account.bratislava.sk'
    const userinfoUrl = `${backendUrl}/oauth/userinfo`

    logger.info('[OAuth] UserInfo request received, forwarding to backend')

    const response = await fetch(userinfoUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error('[OAuth] UserInfo request failed', { status: response.status, data })
      return res.status(response.status).json(data)
    }

    logger.info('[OAuth] UserInfo request successful')
    return res.status(200).json(data)
  } catch (error) {
    logger.error('[OAuth] UserInfo endpoint error', error)
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    })
  }
}
