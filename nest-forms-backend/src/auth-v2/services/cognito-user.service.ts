import {
  AdminGetUserCommandOutput,
  AttributeType,
} from '@aws-sdk/client-cognito-identity-provider'
import { Injectable } from '@nestjs/common'
import { Expose, plainToInstance } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  validateOrReject,
} from 'class-validator'
import {
  UserVerifyStateCognitoTierEnum,
  UserVerifyStateTypeEnum,
} from 'openapi-clients/city-account'

import BaConfigService from '../../config/ba-config.service'
import { CognitoProvidersService } from './cognito-providers.service'

class CognitoUserAttributesDto {
  @Expose()
  @IsUUID()
  sub: string

  @Expose()
  @IsEnum(UserVerifyStateTypeEnum)
  'custom:account_type': UserVerifyStateTypeEnum

  @Expose()
  @IsEnum(UserVerifyStateCognitoTierEnum)
  'custom:tier': UserVerifyStateCognitoTierEnum

  @Expose()
  @IsString()
  given_name: string

  @Expose()
  @IsString()
  family_name: string

  @Expose()
  @IsEmail()
  email: string
}

const mapAttributesToObject = (attributes: AttributeType[] = []) =>
  Object.fromEntries(
    attributes
      .filter(
        (attr): attr is AttributeType & { Name: string } => attr.Name != null,
      )
      .map(({ Name, Value }) => [Name, Value] as const),
  )

const verifyAndMapResponse = async (response: AdminGetUserCommandOutput) => {
  const attributesObject = mapAttributesToObject(response.UserAttributes)

  const validatedAttributes = plainToInstance(
    CognitoUserAttributesDto,
    attributesObject,
    {
      excludeExtraneousValues: true,
    },
  )
  try {
    await validateOrReject(validatedAttributes)
  } catch (error) {
    throw new Error('Invalid user attributes received from Cognito.')
  }

  return {
    userAttributes: validatedAttributes,
    userCreateDate: response.UserCreateDate,
    userLastModifiedDate: response.UserLastModifiedDate,
    userStatus: response.UserStatus,
    username: response.Username,
  }
}

export type CognitoUser = Awaited<ReturnType<typeof verifyAndMapResponse>>

@Injectable()
export class CognitoUserService {
  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly cognitoProvidersService: CognitoProvidersService,
  ) {}

  async getUserAttributes(sub: string) {
    const response =
      await this.cognitoProvidersService.identityProvider.adminGetUser({
        UserPoolId: this.baConfigService.cognito.userPoolId,
        Username: sub,
      })

    return verifyAndMapResponse(response)
  }
}
