import { SetMetadata } from '@nestjs/common'

import { CognitoTiersEnum } from '../global-dtos/cognito.dto'

export const TIERS_KEY = 'custom:tier'
export const Tiers = (...tiers: CognitoTiersEnum[]) =>
  SetMetadata(TIERS_KEY, tiers)
