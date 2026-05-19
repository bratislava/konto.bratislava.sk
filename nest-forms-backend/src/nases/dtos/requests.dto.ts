import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

import { UpdateFormRequestDto } from '../../forms/dtos/requests.dto'

// TODO delete one of these
export class EidSendFormRequestDto {
  @ApiProperty({
    description: 'EID token to send form',
    example: '***',
  })
  @IsString()
  eidToken: string
}

export class EidUpdateSendFormRequestDto extends UpdateFormRequestDto {
  @ApiProperty({
    description: 'EID token to send form',
    example: '***',
  })
  @IsString()
  eidToken: string
}
