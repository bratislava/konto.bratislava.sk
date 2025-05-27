import { applyDecorators } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'

export function ApiCognitoGuestIdentityIdAuth() {
  return applyDecorators(ApiSecurity('cognitoGuestIdentityId'))
}
