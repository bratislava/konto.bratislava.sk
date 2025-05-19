import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { IsBirthNumber, IsIco, IsIdentityCard } from '../../utils/decorators/validation.decorators'

export enum ResponseVerificationIdentityCardMessageEnum {
  SEND_TO_QUEUE = 'SendToQueue',
  ALREADY_VERIFIED = 'AlreadyVerified',
}

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
    description:
      'Birth numbers without slash which should be retrieved from user database.',
    default: ['0000000000', '0000001010'],
    type: String,
    isArray: true,
  })
  @IsArray()
  birthNumbers: string[]
}

export class RequestBodyRequeueVerifyIdentityCardDto {
  @ApiProperty({
    description: 'Birth number for check',
    example: '8808080000',
  })
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber!: string

  @ApiProperty({
    description: 'String of identitiy card',
    example: 'AB123456',
  })
  @IsIdentityCard({
    message: 'Text must be identity card number in format XX000000',
  })
  identityCard!: string

  @ApiProperty({
    description: 'Id of the user to requeue for verification',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsUUID()
  userId!: string
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
