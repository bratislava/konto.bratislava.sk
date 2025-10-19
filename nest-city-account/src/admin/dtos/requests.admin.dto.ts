import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { IsBirthNumber, IsIco } from '../../utils/decorators/validation.decorators'
import { Prisma } from '@prisma/client'

export class RequestQueryUserByBirthNumberDto {
  @ApiProperty({
    description: 'userBirthNumber',
    default: '8808080000',
  })
  @IsNotEmpty()
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber!: string
}

export class RequestBatchQueryUsersByBirthNumbersDto {
  @ApiProperty({
    description: 'Birth numbers without slash which should be retrieved from user database.',
    default: ['0000000000', '0000001010'],
    type: String,
    isArray: true,
  })
  @IsArray()
  birthNumbers: string[]
}

export class RequestBodyValidateEdeskForUserIdsDto {
  @ApiProperty({
    description: 'How many records to skip',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  offset?: number
}

export class ManuallyVerifyUserRequestDto {
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
    description: 'Ifo of the user',
    example: '123456987',
  })
  ifo?: string

  @ApiPropertyOptional({
    description: 'ico',
    example: '00000000',
  })
  @IsOptional()
  @IsIco({
    message: 'Text must be Ico of length 6 to 8 character. Only numeric characters allowed.',
  })
  ico?: string
}

export class IdentityDataDto {
  @ApiProperty({
    description: 'Birth number in format with slash',
    example: '123456/7890',
  })
  @IsBirthNumber()
  birthNumber: string

  @ApiProperty({
    description: 'ID Card number',
    example: 'XX024051',
  })
  @IsString()
  identityCard: string
}
export class WhereUserBasicUniqueDto {
  @ApiPropertyOptional({
    description: 'Local UUID of user',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsOptional()
  @IsUUID()
  id?: string

  @ApiPropertyOptional({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'External ID (e.g., Cognito sub)',
    example: 'e4d909c290d0fb1ca068ffaddf22cbd0',
  })
  @IsOptional()
  @IsString()
  externalId?: string

  @ApiPropertyOptional({
    description: 'IFO (internal identifier, if applicable)',
    example: '123456987',
  })
  @IsOptional()
  @IsString()
  ifo?: string

  @ApiPropertyOptional({
    description: 'Birth number without slash (9 or 10 digits)',
    example: '8808080000',
  })
  @IsOptional()
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber?: string
}

export class ManuallySendUserToVerificationQueueDto {
  @ApiProperty({
    description: 'User identifier for finding the user',
    example: { email: 'user@example.com' },
    type: WhereUserBasicUniqueDto,
  })
  @ValidateNested()
  @Type(() => WhereUserBasicUniqueDto)
  @IsNotEmptyObject()
  where: Prisma.UserWhereUniqueInput & WhereUserBasicUniqueDto

  @ApiPropertyOptional({
    description: 'Optional identity verification data',
    example: {
      birthNumber: '8808080000',
      identityCard: 'AB123456',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => IdentityDataDto)
  identityData?: IdentityDataDto
}

export class RequestValidatePhysicalEntityRfoDto {
  @ApiProperty({
    description: 'Id of the physical entity object in db',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsUUID()
  physicalEntityId!: string
}

export class RequestDeleteTaxDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Birth number in format with slash',
    example: '0000000000',
  })
  @IsString()
  birthNumber: string
}

export class MarkDeceasedAccountRequestDto {
  @ApiProperty({
    description: 'List of birthnumbers/external IDs to mark as deceased',
    example: ['1234567890', '2345678901', '3456789012'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  birthNumbers: string[]
}

export class RequestBatchNewUserBirthNumbers {
  @ApiProperty({
    description: 'Date to query.',
    example: '2023-04-13T14:39:49.004Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  since: Date

  @ApiProperty({
    description:
      'Optionally specify maximum number to return. Will not return more than internal limit (100).',
    example: 20,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number
}
