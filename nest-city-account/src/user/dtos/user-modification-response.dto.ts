import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsObject, IsString } from 'class-validator'
import { AnonymizeResponse } from '../../bloomreach/bloomreach.dto'

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
