import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'

@Injectable()
export class CognitoProvidersService {
  public readonly identity: CognitoIdentityClient

  public readonly identityProvider: CognitoIdentityProviderClient

  constructor(readonly baConfigService: BaConfigService) {
    const config = {
      region: baConfigService.cognito.region,
      credentials: {
        accessKeyId: baConfigService.cognito.accessKeyId,
        secretAccessKey: baConfigService.cognito.secretAccessKey,
      },
    } as const

    this.identity = new CognitoIdentityClient(config)
    this.identityProvider = new CognitoIdentityProviderClient(config)
  }
}
