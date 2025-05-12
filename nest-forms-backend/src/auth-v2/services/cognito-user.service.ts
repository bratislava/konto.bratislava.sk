import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'
import { CognitoProvidersService } from './cognito-providers.service'

@Injectable()
export class CognitoUserService {
  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly cognitoProvidersService: CognitoProvidersService,
  ) {}

  async getUser(sub: string) {
    const response =
      await this.cognitoProvidersService.identityProvider.adminGetUser({
        UserPoolId: this.baConfigService.cognito.userPoolId,
        Username: sub,
      })

    return response
  }
}
