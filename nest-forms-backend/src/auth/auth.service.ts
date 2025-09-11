import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { HttpException, Injectable } from '@nestjs/common'

import {
  CognitoGetUserAttributesData,
  CognitoGetUserData,
  CognitoUserAttributesDto,
} from './dtos/cognito.dto'

@Injectable()
export default class AuthService {
  private attributesToObject(
    data: CognitoUserAttributesDto[],
  ): CognitoGetUserAttributesData {
    const result: CognitoGetUserAttributesData = { sub: '' }

    data.forEach((elem) => {
      const key = elem.Name as keyof CognitoGetUserAttributesData
      if (elem.Value !== undefined) {
        result[key] = elem.Value
      }
    })
    return result
  }

  private async getUser(userId: string): Promise<AdminGetUserCommandOutput> {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_COGNITO_REGION ?? '',
      credentials: {
        accessKeyId: process.env.AWS_COGNITO_ACCESS ?? '',
        secretAccessKey: process.env.AWS_COGNITO_SECRET ?? '',
      },
    })

    const inputParams = {
      UserPoolId: process.env.AWS_COGNITO_USERPOOL_ID ?? '',
      Username: userId,
    }

    try {
      const cognitoData = await cognitoClient.send(
        new AdminGetUserCommand(inputParams),
      )
      return cognitoData
    } catch (error) {
      throw new HttpException(
        {
          // aws-sdk v3 TODO extract the error details
          status: error.statusCode,
          message: error.code,
        },
        400,
      )
    }
  }

  async getDataFromCognito(userId: string): Promise<CognitoGetUserData> {
    const result = await this.getUser(userId)
    return {
      idUser: result.Username,
      ...this.attributesToObject(result.UserAttributes ?? []),
      UserCreateDate: result.UserCreateDate,
      UserLastModifiedDate: result.UserLastModifiedDate,
      Enabled: result.Enabled,
      UserStatus: result.UserStatus,
    }
  }
}
