import { isProductionDeployment } from './general'
import logger from './logger'

export const APPROVED_SSO_ORIGINS = isProductionDeployment()
  ? ['https://kupaliska.bratislava.sk', 'https://bratislava.sk']
  : [
      // multiple ports to make testing login across multiple apps running locally easier
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'https://kupaliska.staging.bratislava.sk',
      'https://kupaliska.bratislava.sk',
      'https://bratislava.sk',
    ]

// returns null if path is invalid or not an allowed origin
export const getValidRedirectFromQuery = (path: unknown) => {
  if (path && typeof path === 'string') {
    // check if it's a local route
    if (path.startsWith('/')) {
      // TODO decodeURIComponent used originally, check if it's needed for some edge-case
      return decodeURIComponent(path)
    }
    // check if it's an approved SSO domain
    try {
      const url = new URL(path)
      if (APPROVED_SSO_ORIGINS.includes(url.origin)) {
        return path
      }
    } catch (error) {
      logger.error('Failed to parse redirect URL', error, path)
    }
  }
  return null
}
