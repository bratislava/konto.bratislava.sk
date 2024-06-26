import { HttpException, Injectable } from '@nestjs/common'
import AWS from 'aws-sdk'

import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { fromPairs } from 'lodash'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CognitoGetUserAttributesData,
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesDto,
  CognitoUserAttributesEnum,
  CognitoUserAttributesValuesDateDto,
  CognitoUserStatusEnum,
} from '../global-dtos/cognito.dto'
import { ErrorThrowerGuard } from '../guards/errors.guard'

@Injectable()
export class CognitoSubservice {
  private readonly cognitoIdentity: AWS.CognitoIdentityServiceProvider

  private readonly config

  constructor(
    private readonly errorThrowerGuard: ErrorThrowerGuard,
    private readonly prisma: PrismaService
  ) {
    if (
      !process.env.AWS_COGNITO_ACCESS ||
      !process.env.AWS_COGNITO_SECRET ||
      !process.env.AWS_COGNITO_REGION ||
      !process.env.AWS_COGNITO_USERPOOL_ID
    ) {
      throw new Error('CognitoSubservice ENV vars are not set ')
    }
    this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider({
      accessKeyId: process.env.AWS_COGNITO_ACCESS,
      secretAccessKey: process.env.AWS_COGNITO_SECRET,
      region: process.env.AWS_COGNITO_REGION,
    })

    this.config = {
      cognitoUserPoolId: process.env.AWS_COGNITO_USERPOOL_ID,
    }
  }

  private attributesToObject(data: CognitoUserAttributesDto[]): CognitoGetUserAttributesData {
    const result = fromPairs(data.map((elem) => [elem.Name, elem.Value]))
    return result as unknown as CognitoGetUserAttributesData
  }

  async getDataFromCognito(userId: string): Promise<CognitoGetUserData> {
    const result = await this.cognitoIdentity
      .adminGetUser(
        {
          UserPoolId: this.config.cognitoUserPoolId,
          Username: userId,
        },
        (err, data) => {
          if (err === null) {
            return data
          } else {
            return err
          }
        }
      )
      .promise()
    if (result.$response.error) {
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        400
      )
    } else {
      return {
        idUser: result.Username,
        ...this.attributesToObject(result.UserAttributes ?? []),
        UserCreateDate: result.UserCreateDate,
        UserLastModifiedDate: result.UserLastModifiedDate,
        Enabled: result.Enabled ?? false,
        UserStatus: result.UserStatus as CognitoUserStatusEnum,
      }
    }
  }

  async cognitoDeactivateUser(userId: string): Promise<void> {
    const result = await this.cognitoIdentity
      .adminDisableUser(
        {
          UserPoolId: this.config.cognitoUserPoolId,
          Username: userId,
        },
        (err, data) => {
          if (err === null) {
            return data
          } else {
            return err
          }
        }
      )
      .promise()

    if (result.$response.error) {
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        400
      )
    }
  }

  async changeCognitoTierAndInDatabase(
    userId: string,
    newTier: CognitoUserAttributesTierEnum,
    accountType: CognitoUserAccountTypesEnum
  ): Promise<void> {
    await this.changeCognitoTier(userId, [
      {
        Name: CognitoUserAttributesEnum.TIER,
        Value: newTier,
      },
    ])

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      const user = await this.prisma.user.findUnique({
        where: {
          externalId: userId
        }
      })
      if (!user) {
        return
      }

      await this.prisma.user.update({
        where: {
          externalId: userId,
        },
        data: {
          cognitoTier: newTier,
        },
      })
    } else {
      const legalPerson = await this.prisma.legalPerson.findUnique({
        where: {
          externalId: userId
        }
      })
      if (!legalPerson) {
        return
      }

      await this.prisma.legalPerson.update({
        where: {
          externalId: userId,
        },
        data: {
          cognitoTier: newTier,
        },
      })
    }
  }

  private async changeCognitoTier(
    userId: string,
    userAttributes: CognitoUserAttributesValuesDateDto[]
  ) {
    await this.cognitoIdentity
      .adminUpdateUserAttributes({
        UserAttributes: userAttributes,
        UserPoolId: this.config.cognitoUserPoolId,
        Username: userId,
      })
      .promise()
      .catch((error) => {
        this.errorThrowerGuard.cognitoTierError(error)
      })
  }

  /**
   * Changes the email in cognito to unique format {cognitoId}-{email}.disabled.bratislava.sk
   * Used so that users with deactivated accounts can recreate new accounts with previously used emails.
   * @param userId user id in cognito
   * @returns void
   */
  async deactivateCognitoMail(
    userId: string,
    oldMail: string,
  ) {
    const result = await this.cognitoIdentity.adminUpdateUserAttributes({
      UserAttributes: [
        {
          Name: 'email',
          Value: `${userId}-${oldMail}.disabled.bratislava.sk`,
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ],
      UserPoolId: this.config.cognitoUserPoolId,
      Username: userId,
    }).promise()

    if (result.$response.error) {
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        400
      )
    }
  }
}
