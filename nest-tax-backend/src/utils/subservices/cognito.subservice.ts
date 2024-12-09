import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import AWS from 'aws-sdk'

import { CognitoTiersEnum } from '../global-dtos/cognito.dto'

@Injectable()
export class CognitoSubservice {
  cognitoIdentity: AWS.CognitoIdentityServiceProvider

  constructor(private readonly configService: ConfigService) {
    this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider({
      accessKeyId: process.env.AWS_COGNITO_ACCESS,
      secretAccessKey: process.env.AWS_COGNITO_SECRET,
      region: process.env.COGNITO_REGION,
    })
    this.configService.getOrThrow<string>('COGNITO_USER_POOL_ID') // Check if exists
  }

  async getDataFromCognito(userId: string): Promise<CognitoTiersEnum> {
    const cognitoData = await this.cognitoIdentity
      .adminGetUser(
        {
          UserPoolId: this.configService.getOrThrow<string>(
            'COGNITO_USER_POOL_ID',
          ),
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
    if (cognitoData.$response.error) {
      throw new HttpException(
        {
          status: cognitoData.$response.error.statusCode,
          message: cognitoData.$response.error.code,
        },
        400,
      )
    } else {
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
}
