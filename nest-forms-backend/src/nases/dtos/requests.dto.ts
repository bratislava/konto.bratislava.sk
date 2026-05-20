import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

import { UpdateFormRequestDto } from '../../forms/dtos/requests.dto'

export class EidUpdateSendFormRequestDto extends UpdateFormRequestDto {
  @ApiProperty({
    description: 'EID token to send form',
    example: '***',
  })
  @IsString()
  eidToken: string
}
