import { Injectable } from '@nestjs/common'
import {
  AdminDisableUserCommand,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider'

import { ErrorsEnum } from '../guards/dtos/error.dto'

import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { fromPairs } from 'lodash'
import { ACTIVE_USER_FILTER, PrismaService } from '../../prisma/prisma.service'
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
  private readonly cognitoClient: CognitoIdentityProviderClient

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
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_COGNITO_REGION,
      credentials: {
        accessKeyId: process.env.AWS_COGNITO_ACCESS,
        secretAccessKey: process.env.AWS_COGNITO_SECRET,
      },
    })

    this.config = {
      cognitoUserPoolId: process.env.AWS_COGNITO_USERPOOL_ID,
    }
  }

  private attributesToObject(data: CognitoUserAttributesDto[]): CognitoGetUserAttributesData {
    const result = fromPairs(data.map((elem) => [elem.Name, elem.Value]))
    return result as unknown as CognitoGetUserAttributesData
  }

  private async getUser(userId: string): Promise<AdminGetUserCommandOutput> {
    const inputParams = {
      UserPoolId: this.config.cognitoUserPoolId,
      Username: userId,
    }

    try {
      const cognitoData = await this.cognitoClient.send(new AdminGetUserCommand(inputParams))
      return cognitoData
    } catch (error) {
      // TODO aws-sdk v3 extract the error details
      // TODO aws-sdk v3 verify usage of throwerErrorGuard here
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        error.name,
        error.statusCode?.toString(),
        undefined,
        error
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
      Enabled: result.Enabled ?? false,
      UserStatus: result.UserStatus as CognitoUserStatusEnum,
    }
  }

  async cognitoDeactivateUser(userId: string): Promise<void> {
    const inputParams = {
      UserPoolId: this.config.cognitoUserPoolId,
      Username: userId,
    }

    try {
      await this.cognitoClient.send(new AdminDisableUserCommand(inputParams))
    } catch (error) {
      // TODO aws-sdk v3 extract the error details
      // TODO aws-sdk v3 verify usage of throwerErrorGuard here
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        error.name,
        error.statusCode?.toString(),
        undefined,
        error
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
          ...ACTIVE_USER_FILTER,
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
    userAttributes: CognitoUserAttributesValuesDateDto[] // TODO aws-sdk v3 check type of this with
  ) {
    const inputParams = {
      UserAttributes: userAttributes,
      UserPoolId: this.config.cognitoUserPoolId,
      Username: userId,
    }
    try {
      await this.cognitoClient.send(new AdminUpdateUserAttributesCommand(inputParams))
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
        SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR,
        undefined,
        error
      )
    }
  }

  /**
   * Changes the email in cognito to unique format {cognitoId}-{email}.disabled.bratislava.sk
   * Used so that users with deactivated accounts can recreate new accounts with previously used emails.
   * @param userId user id in cognito
   * @returns void
   */
  async deactivateCognitoMail(userId: string, oldMail: string) {
    const inputParams = {
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
    }

    try {
      await this.cognitoClient.send(new AdminUpdateUserAttributesCommand(inputParams))
    } catch (error) {
      // TODO aws-sdk v3 extract the error details
      // TODO aws-sdk v3 verify usage of throwerErrorGuard here
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        error.name,
        error.statusCode?.toString(),
        undefined,
        error
      )
    }
  }

  /**
   * Returns all formatted users from cognito user pool
   * @returns CognitoGetUserAttributesData[]
   */
  async getAllCognitoUsers(): Promise<CognitoGetUserAttributesData[]> {
    const result: Array<UserType> = []
    const params: ListUsersCommandInput = {
      UserPoolId: this.config.cognitoUserPoolId,
    }
    do {
      // TODO: add proper error handling
      const cognitoData = await this.cognitoClient.send(new ListUsersCommand(params))
      result.push(...(cognitoData.Users ?? []))
      params.PaginationToken = cognitoData.PaginationToken
    } while (params.PaginationToken)

    return result.map((user) => this.attributesToObject(user.Attributes ?? []))
  }
}
