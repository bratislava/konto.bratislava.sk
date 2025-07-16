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

export class GinisGetFilesResponseInfo {
  msg_id: string

  doc_id: string
}

export class GinisAssignSubmissionResponseInfo extends GinisGetFilesResponseInfo {}

export class GinisEditSubmissionResponseInfo {
  doc_id: string

  actions: Record<string, string>
}

export class GinisCheckNasesPayloadDto {
  formId: string

  tries: number

  userData: RabbitPayloadUserDataDto
}
