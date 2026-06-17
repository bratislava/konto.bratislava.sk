export class RabbitPayloadDto {
  declare formId: string

  declare tries: number

  declare userData: RabbitPayloadUserDataDto
}

export class RabbitPayloadUserDataDto {
  firstName: string | null

  email: string | null
}
