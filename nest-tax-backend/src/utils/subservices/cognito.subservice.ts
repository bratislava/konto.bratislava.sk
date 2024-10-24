import { HttpException, Injectable } from '@nestjs/common'
import AWS from 'aws-sdk'

@Injectable()
export class CognitoSubservice {
  cognitoIdentity: AWS.CognitoIdentityServiceProvider

  constructor() {
    this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider({
      accessKeyId: process.env.AWS_COGNITO_ACCESS,
      secretAccessKey: process.env.AWS_COGNITO_SECRET,
      region: process.env.COGNITO_REGION,
    })
  }

  async getDataFromCognito(userId: string): Promise<string> {
    const cognitoData = await this.cognitoIdentity
      .adminGetUser(
        {
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
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
      // TODO remake for loop to forEach
      // eslint-disable-next-line no-restricted-syntax
      for (const elem of cognitoData.UserAttributes) {
        if (elem.Name === 'custom:tier') {
          return elem.Value
        }
      }
      return null
    }
  }
}
