import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAttributesTierEnum } from '@prisma/client'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator'
import { AnonymizeResponse } from '../../bloomreach/bloomreach.dto'
import { UserAttributeEnum } from '../../user/dtos/gdpr.user.dto'
import { IsBirthNumber } from '../../utils/decorators/validation.decorators'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
} from '../../utils/global-dtos/cognito.dto'

export class ResponseUserByBirthNumberDto {
  @ApiProperty({
    description: 'userBirthNumber',
    default: '8808080000',
  })
  birthNumber!: string | null

  @ApiProperty({
    description: 'email',
    default: 'brtaislavcan@bratislava.sk',
  })
  email!: string | null

  @ApiProperty({
    description: 'Cognito Id',
    default: 'd18cbd7c-daad-4d5d-a1d7-8e47f845baab',
  })
  externalId!: string | null

  @ApiProperty({
    description: 'Special user attribute for user segmentation',
    default: UserAttributeEnum.TAX2023,
  })
  userAttribute: string | UserAttributeEnum | null

  @ApiProperty({
    description: 'Tier from cognito',
    default: CognitoUserAttributesTierEnum.IDENTITY_CARD,
  })
  // eslint-disable-next-line @typescript-eslint/ban-types
  cognitoAttributes?: CognitoGetUserData | {}
}

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
      'If set, then this number was used for verifiying, but is already in our database for other user.',
    example: '7902301011',
  })
  @IsString()
  birthNumberAlreadyExists?: string

  @ApiProperty({
    description:
      'If set, then this number was used for verifiying, but is already in our database for other user.',
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

export class DeactivateAccountResponseDto {
  @ApiProperty({
    description: 'Marks if the operation has been successful',
    example: true,
  })
  @IsBoolean()
  success!: boolean

  @ApiProperty({
    description: 'Status of the anonymization of user in bloomreach',
    example: AnonymizeResponse.SUCCESS,
    enum: AnonymizeResponse,
  })
  @IsEnum(AnonymizeResponse)
  bloomreachRemoved!: AnonymizeResponse

  @ApiProperty({
    description:
      'Status of the removal of tax delivery methods in Noris. If false, there was an error. If true it was successful, or the user is not a tax payer in Noris.',
    example: true,
  })
  @IsBoolean()
  taxDeliveryMethodsRemoved!: boolean
}

export class MarkDeceasedAccountResponseItemDto {
  @ApiProperty({
    description: 'Birth number of the deceased person',
    example: '1234567890',
  })
  @IsString()
  birthNumber!: string

  @ApiProperty({
    description: 'Whether the user was successfully marked as deceased in the database',
    example: true,
  })
  @IsBoolean()
  databaseMarked!: boolean

  @ApiProperty({
    description: 'Whether the user was successfully archived in Cognito / mail was changed.',
    example: true,
  })
  @IsBoolean()
  cognitoArchived!: boolean

  @ApiProperty({
    description: 'Status of the anonymization of user in Bloomreach',
    example: AnonymizeResponse.SUCCESS,
    enum: AnonymizeResponse,
  })
  @IsEnum(AnonymizeResponse)
  bloomreachRemoved?: AnonymizeResponse
}

export class MarkDeceasedAccountResponseDto {
  @ApiProperty({
    description: 'List of birth numbers with success marked for each data storage.',
    type: [MarkDeceasedAccountResponseItemDto],
  })
  @IsObject({ each: true })
  results!: MarkDeceasedAccountResponseItemDto[]
}

export class VerificationDataForUser {
  @ApiProperty({
    description: 'Id of the user in cognito.',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsString()
  @IsUUID()
  userId!: string

  @ApiProperty({
    description: 'userBirthNumber',
    default: '8808080000',
  })
  @IsNotEmpty()
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber!: string

  @ApiProperty({
    description: 'Id card used for verification.',
    example: 'AA123123',
  })
  @IsString()
  idCard!: string

  @ApiPropertyOptional({
    description: 'Ico used for verification.',
    example: '65451354',
  })
  @IsString()
  ico?: string

  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  verifyStart!: Date
}

export class VerificationDataForUserResponseDto {
  @ApiProperty({
    description: 'Id of the user in cognito.',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsString()
  @IsUUID()
  externalId!: string | null

  @ApiProperty({
    description: 'Email of the user.',
    example: 'test@bratislava.sk',
  })
  @IsEmail()
  email!: string | null

  @ApiProperty({
    type: [VerificationDataForUser],
    description:
      'Verification data for the user in the last month. Ordered by start date descending.',
  })
  verificationDataLastMonth!: VerificationDataForUser[]
}

export class ValidatedUsersToPhysicalEntitiesResponseDto {
  @IsNumber()
  existingPhysicalEntitiesUpdated!: number

  @IsNumber()
  newPhysicalEntitiesCreated!: number
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

export class GetUserDataByBirthNumbersBatchResponseDto {
  @ApiProperty({
    description: 'A record of users keyed by their birth number',
    type: 'object',
    additionalProperties: { type: 'ResponseUserByBirthNumberDto' },
  })
  @IsObject()
  users: Record<string, ResponseUserByBirthNumberDto>
}
