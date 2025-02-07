import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import AWS from 'aws-sdk'

import { CognitoTiersEnum } from '../global-dtos/cognito.dto'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

@Injectable()
export class CognitoSubservice {
  cognitoIdentity: AWS.CognitoIdentityServiceProvider

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
  ) {
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
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        cognitoData.$response.error.code,
        cognitoData.$response.error.statusCode?.toString(),
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
