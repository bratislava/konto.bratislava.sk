import { applyDecorators } from '@nestjs/common'
import { ApiHeader } from '@nestjs/swagger'

import { cognitoGuestIdentityIdHeaderKey } from '../utils/extract-cognito-guest-identity-id-from-request'

export function ApiCognitoGuestIdentityIdAuth() {
  return applyDecorators(
    ApiHeader({
      name: cognitoGuestIdentityIdHeaderKey,
      description: 'Cognito Guest Identity ID for unauthenticated user access',
      required: false,
    }),
  )
}
