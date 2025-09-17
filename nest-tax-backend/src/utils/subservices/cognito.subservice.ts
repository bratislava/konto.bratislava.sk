import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
} from '@aws-sdk/client-cognito-identity-provider'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { CognitoTiersEnum } from '../global-dtos/cognito.dto'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

@Injectable()
export class CognitoSubservice {
  cognitoClient: CognitoIdentityProviderClient

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
  ) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.configService.getOrThrow<string>('COGNITO_REGION'),
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('AWS_COGNITO_ACCESS'),
        secretAccessKey:
          this.configService.getOrThrow<string>('AWS_COGNITO_SECRET'),
      },
    })
    this.configService.getOrThrow<string>('COGNITO_USER_POOL_ID') // Check if exists
  }

  private async getUser(userId: string): Promise<AdminGetUserCommandOutput> {
    const inputParams = {
      UserPoolId: this.configService.getOrThrow<string>('COGNITO_USER_POOL_ID'),
      Username: userId,
    }

    try {
      return await this.cognitoClient.send(new AdminGetUserCommand(inputParams))
    } catch (error) {
      if (error instanceof CognitoIdentityProviderServiceException) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          error.name,
          error.$metadata?.httpStatusCode?.toString(),
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Unknown error occurred when fetching user from Cognito',
        undefined,
        undefined,
        error,
      )
    }
  }

  async getUserTierFromCognito(userId: string): Promise<CognitoTiersEnum> {
    const cognitoData = await this.getUser(userId)
    let result: CognitoTiersEnum = CognitoTiersEnum.NEW
    cognitoData.UserAttributes?.forEach((elem) => {
      if (elem.Name === 'custom:tier') {
        result = elem.Value
          ? (elem.Value as CognitoTiersEnum)
          : CognitoTiersEnum.NEW
      }
    })
    return result
  }
}
