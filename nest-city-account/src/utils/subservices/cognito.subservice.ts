import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
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
import ThrowerErrorGuard from '../guards/errors.guard'
import {
  SendToQueueErrorsEnum,
  SendToQueueErrorsResponseEnum,
} from '../../user-verification/verification.errors.enum'

@Injectable()
export class CognitoSubservice {
  private readonly cognitoIdentity: AWS.CognitoIdentityServiceProvider

  private readonly config

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
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
      // TODO: Use throwerErrorGuard
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        HttpStatus.BAD_REQUEST
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
      // TODO: Use throwerErrorGuard
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async changeTier(
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

    // i don't think this (cognito.subservice) is the right place for
    // calling bloomreach service as well as database update

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      const user = await this.prisma.user.findUnique({
        where: {
          externalId: userId,
          isDeceased: { not: true },
        },
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
          externalId: userId,
        },
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
        throw this.throwerErrorGuard.UnprocessableEntityException(
          SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
          SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR,
          undefined,
          error
        )
      })
  }

  /**
   * Changes the email in cognito to unique format {cognitoId}-{email}.disabled.bratislava.sk
   * Used so that users with deactivated accounts can recreate new accounts with previously used emails.
   * @param userId user id in cognito
   * @returns void
   */
  async deactivateCognitoMail(userId: string, oldMail: string) {
    const result = await this.cognitoIdentity
      .adminUpdateUserAttributes({
        UserAttributes: [
          {
            Name: 'email',
            Value: `${userId}-${oldMail}.disabled.bratislava.sk`,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
        UserPoolId: this.config.cognitoUserPoolId,
        Username: userId,
      })
      .promise()

    if (result.$response.error) {
      // TODO This error is a bit of a problem for me, as I don't want to break anything.
      // TODO status in exception and in response may not match and we can't do that with throwerErrorGuard as of right now
      throw new HttpException(
        {
          status: result.$response.error.statusCode,
          message: result.$response.error.code,
        },
        HttpStatus.BAD_REQUEST
      )
    }
  }
}
