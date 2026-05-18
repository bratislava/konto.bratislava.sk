import { RabbitPayloadUserDataDto } from '../../form-delivery-consumer/dtos/form-delivery-consumer.dto'

export class GinisCheckNasesPayloadDto {
  formId: string

  tries: number

  userData: RabbitPayloadUserDataDto
}
