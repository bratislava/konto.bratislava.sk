import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
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
      const cognitoData = await this.cognitoClient.send(
        new AdminGetUserCommand(inputParams),
      )
      return cognitoData
    } catch (error) {
      // aws-sdk v3 TODO extract the error details
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        error.name,
        error.statusCode?.toString(),
        undefined,
        error,
      )
    }
  }

  async getDataFromCognito(userId: string): Promise<CognitoTiersEnum> {
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
