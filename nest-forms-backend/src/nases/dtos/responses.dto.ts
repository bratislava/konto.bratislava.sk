/* eslint-disable pii/no-phone-number */
/* eslint-disable pii/no-email */
import { HttpStatus } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsUUID } from 'class-validator'

import { GetFormResponseDto } from './requests.dto'

export interface NasesSendResponse {
  status: HttpStatus
  data: unknown
}

export class ResponseGdprDataDto {
  @ApiProperty({
    description: 'Local ID of user',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  declare id: string

  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  declare createdAt: Date

  @ApiProperty({
    description: 'Last updated timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  declare updatedAt: Date

  @ApiPropertyOptional({
    description:
      'Id from cognito, it is not required. We can have also only subscribed user, who are not city account users',
    default: 'e51754f2-3367-43f6-b9bc-b5c6131b041a',
  })
  declare externalId?: string

  @ApiProperty({
    description: 'Email',
    default: 'test@bratislava.sk',
  })
  declare email: string

  @ApiPropertyOptional({
    description: 'Ico of company, which this user represents',
    default: '000000',
  })
  ico?: string

  @ApiProperty({
    description: 'Birth number',
    default: '9909090000',
  })
  declare birthNumber: string | null
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

export class CreateFormResponseDto extends GetFormResponseDto {}

/* eslint-enable pii/no-phone-number */
/* eslint-enable pii/no-email */
