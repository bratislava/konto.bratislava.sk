import { SetMetadata } from '@nestjs/common'
import { UserVerifyStateCognitoTierEnum } from 'openapi-clients/city-account'

export const TIERS_KEY = 'custom:tier'
export const Tiers = (...tiers: UserVerifyStateCognitoTierEnum[]) =>
  SetMetadata(TIERS_KEY, tiers)
