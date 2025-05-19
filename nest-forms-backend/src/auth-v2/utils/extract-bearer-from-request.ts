import { isString } from 'class-validator'
import type { Request } from 'express'

export const bearerTokenHeaderKey = 'authorization'

export function extractBearerFromRequest(request: Request) {
  const bearerTokenHeader = request.headers[bearerTokenHeaderKey]
  if (!bearerTokenHeader) {
    return null
  }
  if (!isString(bearerTokenHeader)) {
    throw new Error(
      `Expected header ${bearerTokenHeaderKey} to be a string in the format "Bearer <token>"`,
    )
  }

  const match = bearerTokenHeader.match(/^Bearer\s+(.+)$/)
  if (!match || !match[1]) {
    throw new Error(
      `Invalid format for header ${bearerTokenHeaderKey}. Expected "Bearer <token>"`,
    )
  }

  return match[1]
}
