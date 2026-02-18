import { Injectable } from '@nestjs/common'
import {
  AdminDisableUserCommand,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  AttributeType,
  AuthFlowType,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
  InitiateAuthCommand,
  ListUsersCommand,
  ListUsersCommandInput,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider'
import { plainToInstance } from 'class-transformer'
import { ErrorsEnum } from '../guards/dtos/error.dto'

import { CognitoUserAttributesTierEnum } from '@prisma/client'
import {
  CognitoGetUserAttributesData,
  CognitoGetUserData,
  CognitoUserAttributesEnum,
  CognitoUserStatusEnum,
} from '../global-dtos/cognito.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import {
  SendToQueueErrorsEnum,
  SendToQueueErrorsResponseEnum,
} from '../../user-verification/verification.errors.enum'

/**
 * Service responsible for Cognito API interactions only.
 * Does not contain business logic or database operations.
 * For tier management with database synchronization, use UserTierService.
 */
@Injectable()
export class CognitoSubservice {
  private readonly cognitoClient: CognitoIdentityProviderClient

  private readonly config

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
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

  private attributesToObject(attributes: AttributeType[]): CognitoGetUserAttributesData {
    const obj = Object.fromEntries(
      attributes
        .filter((attr): attr is AttributeType & { Name: string } => attr.Name != null)
        .map(({ Name, Value }) => [Name, Value] as const)
    )
    return plainToInstance(CognitoGetUserAttributesData, obj, {
      enableImplicitConversion: true,
    })
  }

  private async getUser(userId: string): Promise<AdminGetUserCommandOutput> {
    const inputParams = {
      UserPoolId: this.config.cognitoUserPoolId,
      Username: userId,
    }

    try {
      return await this.cognitoClient.send(new AdminGetUserCommand(inputParams))
    } catch (error) {
      if (error instanceof CognitoIdentityProviderServiceException) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          error.name,
          undefined,
          error
        )
      }
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Unknown error occurred when fetching user from Cognito',
        undefined,
        error
      )
    }
  }

  async getDataFromCognito(userId: string): Promise<CognitoGetUserData> {
    const result = await this.getUser(userId)

    if (result.Username === undefined) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
        'Username undefined in user data from Cognito'
      )
    }

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
      if (error instanceof CognitoIdentityProviderServiceException) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          error.name,
          undefined,
          error
        )
      }
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Unknown error occurred when disabling user in Cognito',
        undefined,
        error
      )
    }
  }

  /**
   * Updates user tier in Cognito only.
   * Note: This does NOT update the database. For coordinated tier changes with database sync,
   * use UserTierService.changeTier() instead.
   */
  async changeTier(userId: string, newTier: CognitoUserAttributesTierEnum): Promise<void> {
    const inputParams = {
      UserAttributes: [
        {
          Name: CognitoUserAttributesEnum.TIER,
          Value: newTier,
        },
      ],
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
      if (error instanceof CognitoIdentityProviderServiceException) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          error.name,
          undefined,
          error
        )
      }
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Unknown error occurred when updating user attributes in Cognito',
        undefined,
        error
      )
    }
  }

  /**
   * Returns all formatted users from cognito user pool
   * @returns CognitoGetUserData[]
   */
  async getAllCognitoUsers(): Promise<CognitoGetUserData[]> {
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
    return result.map((user) => {
      return {
        idUser: user.Username ?? '',
        ...this.attributesToObject(user.Attributes ?? []),
        UserCreateDate: user.UserCreateDate,
        UserLastModifiedDate: user.UserLastModifiedDate,
        Enabled: user.Enabled ?? false,
        UserStatus: user.UserStatus as CognitoUserStatusEnum,
      }
    })
  }

  async refreshTokens(refreshToken: string, clientId: string) {
    const inputParams = {
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    }

    try {
      const response = await this.cognitoClient.send(new InitiateAuthCommand(inputParams))
      if (response.AuthenticationResult === undefined) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
          'AuthenticationResult undefined in response to refresh tokens request from Cognito'
        )
      }
      return {
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
      }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
        'Unexpected error occurred when refreshing tokens via Cognito',
        undefined,
        error
      )
    }
  }
}
