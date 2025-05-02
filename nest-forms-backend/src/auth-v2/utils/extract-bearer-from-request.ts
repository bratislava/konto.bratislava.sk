import { isString } from 'class-validator'
import type { Request } from 'express'

export const bearerTokenHeaderKey = 'authorization'

export function extractBearerFromRequest(request: Request) {
  const bearerToken = request.headers[bearerTokenHeaderKey]
  if (!bearerToken) {
    return null
  }
  if (!isString(bearerToken)) {
    throw new Error('adas')
  }

  const [_, token] = bearerToken.split(' ')
  if (!token) {
    return null
  }
  return token
}
