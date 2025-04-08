import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsUUID } from 'class-validator'

export interface NasesSendResponse {
  status: HttpStatus
  data: unknown
}

export class CanSendResponseDto {
  @ApiProperty({
    description: 'True if given form can be sent to Nases.',
    default: true,
  })
  @IsBoolean()
  canSend: boolean

  @ApiProperty({
    description: 'ID of form',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  @IsUUID()
  formId: string
}

export class MigrateFormResponseDto {
  @ApiProperty({
    description: 'ID of form',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  @IsUUID()
  formId: string

  @ApiProperty({
    description: 'True if the form was successfully migrated.',
    default: true,
  })
  @IsBoolean()
  success: boolean
}

export class CreateFormResponseDto {
  @ApiProperty({
    description: 'ID of form',
    example: '133e0473-44da-407a-b24f-12da343e808d',
  })
  @IsUUID()
  formId: string
}
