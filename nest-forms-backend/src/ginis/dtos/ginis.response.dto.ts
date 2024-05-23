import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString, IsUUID } from 'class-validator'

import { RabbitPayloadUserDataDto } from '../../nases-consumer/nases-consumer.dto'

export type GinisAutomationResponse<T, I> =
  | {
      status: 'success'

      result: T

      info: I
    }
  | {
      status: 'failure'

      message?: string

      info: I
    }

export class GinisRegisterSubmissionResponseInfo {
  msg_id: string // formId
}

export class GinisRegisterSubmissionResponse {
  identifier: string
}

export class GinisUploadInfo {
  'Kategória prílohy': string

  // eslint-disable-next-line prettier/prettier
  'Názov': string

  'Prípona súboru': string

  // eslint-disable-next-line prettier/prettier
  'Veľkosť': string

  // eslint-disable-next-line prettier/prettier
  'Počet': string

  Popis: string

  // eslint-disable-next-line prettier/prettier
  'Súbor': string

  'Dátum zmeny': string

  // eslint-disable-next-line prettier/prettier
  'Zoraďovanie': string

  Poradie: string
}

export class GinisUploadFileResponseInfo {
  msg_id: string // formId

  file_id: string
}

export class GinisUploadFileResponse {
  upload_info: object // Empty or GinisUploadInfo
}

export class GinisGetFilesResponseInfo {
  msg_id: string

  doc_id: string
}

export class GinisAssignSubmissionResponseInfo extends GinisGetFilesResponseInfo {}

export class GinisEditSubmissionResponseInfo {
  doc_id: string

  actions: Record<string, string>
}

export class GinisGetFilesResponse {
  attachments: GinisUploadInfo[]
}

export class GinisCheckNasesPayloadDto {
  formId: string

  tries: number

  userData: RabbitPayloadUserDataDto
}

export class TryAgainGinisRegisterResponseDto {
  @ApiProperty({
    description: 'Id of the form.',
    example: 'ffef673e-b36a-4f50-afcc-41d530af967d',
  })
  @IsUUID()
  formId: string

  @ApiProperty({
    description: 'If the submission was started again',
    example: true,
  })
  @IsBoolean()
  started: boolean
}

export class EditSubmissionResponse {
  @ApiProperty({
    description:
      'Message confirming that the edit request has been put to queue',
    example:
      'The request to edit the form 2c5ecbf1-9664-4ee6-a8d4-31ace63cffc2 was succefully queued',
  })
  @IsString()
  message: string
}
