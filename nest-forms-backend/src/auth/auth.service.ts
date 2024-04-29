import { HttpException, Injectable } from '@nestjs/common'
import * as AWS from 'aws-sdk'

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

  async getDataFromCognito(userId: string): Promise<CognitoGetUserData> {
    const cognito = new AWS.CognitoIdentityServiceProvider({
      accessKeyId: process.env.AWS_COGNITO_ACCESS,
      secretAccessKey: process.env.AWS_COGNITO_SECRET,
      region: process.env.AWS_COGNITO_REGION,
    })
    const result = await cognito
      .adminGetUser(
        {
          UserPoolId: process.env.AWS_COGNITO_USERPOOL_ID ?? '',
          Username: userId,
        },
        (err, data) => {
          if (err === null) {
            return data
          }
          return err
        },
      )
      .promise()
    if (result.$response.error) {
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        400,
      )
    } else {
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
}
