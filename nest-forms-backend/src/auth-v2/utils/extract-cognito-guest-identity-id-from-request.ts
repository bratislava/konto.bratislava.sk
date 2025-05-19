import type { Request } from 'express'
import isString from 'lodash/isString'

export const cognitoGuestIdentityIdHeaderKey = 'X-Cognito-Guest-Identity-Id'

export function extractCognitoGuestIdentityIdFromRequest(request: Request) {
  const cognitoGuestIdentityId =
    request.headers[cognitoGuestIdentityIdHeaderKey.toLowerCase()]

  if (!cognitoGuestIdentityId) {
    return null
  }
  if (!isString(cognitoGuestIdentityId)) {
    throw new Error(
      `Expected header ${cognitoGuestIdentityIdHeaderKey} to be a string`,
    )
  }

  return cognitoGuestIdentityId
}
