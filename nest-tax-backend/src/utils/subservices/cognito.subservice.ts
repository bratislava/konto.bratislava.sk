import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
} from '@aws-sdk/client-cognito-identity-provider'
import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import { CognitoUserAttributesTierEnum } from 'openapi-clients/city-account'

import BaConfigService from '../../config/ba-config.service'

@Injectable()
export class CognitoSubservice {
  cognitoClient: CognitoIdentityProviderClient

  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly baConfigService: BaConfigService,
  ) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.baConfigService.cognito.region,
      credentials: {
        accessKeyId: this.baConfigService.cognito.accessKeyId,
        secretAccessKey: this.baConfigService.cognito.secretAccessKey,
      },
    })
  }

  private async getUser(userId: string): Promise<AdminGetUserCommandOutput> {
    const inputParams = {
      UserPoolId: this.baConfigService.cognito.userPoolId,
      Username: userId,
    }

    try {
      return await this.cognitoClient.send(new AdminGetUserCommand(inputParams))
    } catch (error) {
      if (error instanceof CognitoIdentityProviderServiceException) {
        throw this.errorFactoryService.BadRequestException({
          errorEnum: ErrorEnum.BAD_REQUEST_ERROR,
          message: error.name,
          console: { cognitoHttpStatusCode: error.$metadata.httpStatusCode },
          error,
        })
      }
      throw this.errorFactoryService.BadRequestException({
        errorEnum: ErrorEnum.BAD_REQUEST_ERROR,
        message: 'Unknown error occurred when fetching user from Cognito',
        error,
      })
    }
  }

  async getUserTierFromCognito(
    userId: string,
  ): Promise<CognitoUserAttributesTierEnum> {
    const cognitoData = await this.getUser(userId)
    let result: CognitoUserAttributesTierEnum =
      CognitoUserAttributesTierEnum.New
    cognitoData.UserAttributes?.forEach((elem) => {
      if (elem.Name === 'custom:tier') {
        result = elem.Value
          ? (elem.Value as CognitoUserAttributesTierEnum)
          : CognitoUserAttributesTierEnum.New
      }
    })
    return result
  }
}
