import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator'
import { CognitoUserAccountTypesEnum } from '../../utils/global-dtos/cognito.dto'

export class UserVerifyState {
  @ApiPropertyOptional({
    description: "Id of given user's email, if exists",
  })
  externalId?: string | null

  @ApiPropertyOptional({
    description: 'Type of user.',
    example: CognitoUserAccountTypesEnum.LEGAL_ENTITY,
    enum: CognitoUserAccountTypesEnum,
  })
  @IsEnum(CognitoUserAccountTypesEnum)
  type?: CognitoUserAccountTypesEnum

  @ApiProperty({
    description: 'Marks if the user with given email is in database.',
    example: true,
  })
  @IsBoolean()
  isInDatabase!: boolean

  @ApiProperty({
    description: 'Marks if the user with given email is in cognito.',
    example: true,
  })
  @IsBoolean()
  isInCognito!: boolean

  @ApiProperty({
    description: 'Current cognito tier, marks the status of verifying.',
    example: CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
    enum: CognitoUserAttributesTierEnum,
  })
  @IsEnum(CognitoUserAttributesTierEnum)
  cognitoTier?: CognitoUserAttributesTierEnum

  @ApiProperty({
    description:
      'If set, then this number was used for verifying, but is already in our database for other user.',
    example: '7902301011',
  })
  @IsString()
  birthNumberAlreadyExists?: string

  @ApiProperty({
    description:
      'If set, then this number was used for verifying, but is already in our database for other user.',
    example: '7902301011',
  })
  @IsString()
  birthNumberIcoAlreadyExists?: string

  @ApiProperty({
    description: 'Marks if the user with given email is verified.',
    example: false,
  })
  @IsBoolean()
  isVerified!: boolean

  @ApiPropertyOptional({
    description: 'Possible cause of the verify error.',
    example: 'TODO',
  })
  @IsString()
  possibleCause?: string
}

export class OnlySuccessDto {
  @ApiProperty({
    description: 'Marks if the operation has been successful',
    example: true,
  })
  @IsBoolean()
  success!: boolean
}

export class ValidateEdeskForUserIdsResponseDto {
  @ApiProperty({
    description: 'Number of users that were validated',
    example: 1,
  })
  @IsNumber()
  validatedUsers!: number

  @ApiProperty({
    description: 'Temp debug data',
    example: null,
  })
  //TODO: add types
  enitites: unknown
}

export class ResponseValidatePhysicalEntityRfoDto {
  @ApiProperty({
    description: 'Entity data (updated if new info was found in state registry)',
    example: {},
  })
  //TODO: add types
  physicalEntity: unknown

  @ApiProperty({
    description: 'Data received from RFO',
    example: {},
  })
  //TODO: add types
  rfoData: unknown

  @ApiProperty({
    description: 'Data received from UPVS',
    example: {},
  })
  //TODO: add types
  upvsResult: unknown
}
