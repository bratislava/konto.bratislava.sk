import { RabbitPayloadUserDataDto } from '../../form-delivery-consumer/dtos/form-delivery-consumer.dto'

export class GinisCheckDeliveryPayloadDto {
  formId: string

  tries: number

  userData: RabbitPayloadUserDataDto
}
