import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class ResponseCreatedAlreadyCreatedDto {
  @ApiProperty({
    description: 'Number of created records',
    default: 1,
  })
  @IsNumber()
  created: number

  @ApiProperty({
    description: 'Number of records that already existed in the database',
    default: 1,
  })
  @IsNumber()
  alreadyCreated: number
}
