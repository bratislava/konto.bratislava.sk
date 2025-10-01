import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { Type } from 'class-transformer'
import { IsBirthNumber, IsIco } from '../../utils/decorators/validation.decorators'

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

export class RequestValidatePhysicalEntityRfoDto {
  @ApiProperty({
    description: 'Id of the physical entity object in db',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsUUID()
  physicalEntityId!: string
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
