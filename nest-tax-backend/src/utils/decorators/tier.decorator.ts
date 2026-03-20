import { SetMetadata } from '@nestjs/common'
import { CognitoUserAttributesTierEnum } from 'openapi-clients/city-account'

export const TIERS_KEY = 'custom:tier'
export const Tiers = (...tiers: CognitoUserAttributesTierEnum[]) =>
  SetMetadata(TIERS_KEY, tiers)
