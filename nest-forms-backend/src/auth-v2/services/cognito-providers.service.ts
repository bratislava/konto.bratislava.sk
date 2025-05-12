import { CognitoIdentity } from '@aws-sdk/client-cognito-identity'
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider'
import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'

@Injectable()
export class CognitoProvidersService {
  public readonly identity: CognitoIdentity

  public readonly identityProvider: CognitoIdentityProvider

  constructor(readonly baConfigService: BaConfigService) {
    const config = {
      region: baConfigService.cognito.region,
      credentials: {
        accessKeyId: baConfigService.cognito.accessKeyId,
        secretAccessKey: baConfigService.cognito.secretAccessKey,
      },
    } as const

    this.identity = new CognitoIdentity(config)
    this.identityProvider = new CognitoIdentityProvider(config)
  }
}
