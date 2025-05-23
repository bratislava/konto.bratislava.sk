import { UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import isString from 'lodash/isString'

export const bearerTokenHeaderKey = 'Authorization'

export function extractBearerFromRequest(request: Request) {
  const bearerTokenHeader = request.headers[bearerTokenHeaderKey.toLowerCase()]
  if (!bearerTokenHeader) {
    return null
  }

  if (!isString(bearerTokenHeader)) {
    throw new UnauthorizedException(
      `Expected header ${bearerTokenHeaderKey} to be a string in the format "Bearer <token>"`,
    )
  }

  const match = bearerTokenHeader.match(/^Bearer\s([\w.-]+)$/)
  if (!match || !match[1]) {
    throw new UnauthorizedException(
      `Invalid format for header ${bearerTokenHeaderKey}. Expected "Bearer <token>"`,
    )
  }

  return match[1]
}
