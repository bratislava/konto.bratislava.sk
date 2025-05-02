import type { Request } from 'express'
import isString from 'lodash/isString'

export const cognitoGuestIdentityIdHeaderKey = 'X-Cognito-Guest-Identity-Id'
const cognitoGuestIdentityIdHeaderKeyLowercase =
  cognitoGuestIdentityIdHeaderKey.toLowerCase()

export function extractCognitoGuestIdentityIdFromRequest(request: Request) {
  // console.log(request.headers)
  const cognitoGuestIdentityId =
    request.headers[cognitoGuestIdentityIdHeaderKey] ??
    request.headers[cognitoGuestIdentityIdHeaderKeyLowercase]
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
