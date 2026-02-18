import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { IsBirthNumber } from '../../utils/decorators/validation.decorators'

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
