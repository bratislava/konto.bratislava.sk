import { RabbitPayloadUserDataDto } from '../../nases-consumer/nases-consumer.dto'

export class GinisCheckNasesPayloadDto {
  formId: string

  tries: number

  userData: RabbitPayloadUserDataDto
}
