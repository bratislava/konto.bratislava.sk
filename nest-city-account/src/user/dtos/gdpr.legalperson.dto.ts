import { ApiProperty } from '@nestjs/swagger'
import { LegalPerson } from '@prisma/client'
import { GdprCategory, GdprSubType, GdprType } from './gdpr.user.dto'

export class ResponseGdprLegalPersonDataDto {
  category!: GdprCategory

  type!: GdprType

  subType!: GdprSubType
}

export class ResponseLegalPersonDataSimpleDto {
  @ApiProperty({
    description: 'Local ID of user',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  id!: string

  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  createdAt!:Date

  @ApiProperty({
    description: 'Last updated timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  updatedAt!: Date

  @ApiProperty({
    description:
      'Id from cognito, it is not required. We can have also only subscribed user, who are not city account users',
    default: 'e51754f2-3367-43f6-b9bc-b5c6131b041a',
  })
  externalId: string | null

  @ApiProperty({
    description: 'Ico of company, which this user represents',
    default: '000000',
  })
  ico: string | null

  @ApiProperty({
    description: 'Email',
    default: 'test@bratislava.sk',
  })
  email: string | null

  @ApiProperty({
    description: 'Birth number',
    default: '9909090000',
  })
  birthNumber: string | null
}

export class ResponseLegalPersonDataDto extends ResponseLegalPersonDataSimpleDto {
  @ApiProperty({
    description: 'Subscription Data in array',
    default: [
      {
        category: 'CITY',
        type: 'ANALYTICS',
        subType: 'unsubscribe',
      },
      {
        category: 'CITY',
        type: 'DATAPROCESSING',
        subType: 'unsubscribe',
      },
    ],
  })
  gdprData!: ResponseGdprLegalPersonDataDto[]
}

export class ResponsePublicLegalPersonUnsubscribeDto {
  @ApiProperty({
    description: 'Local ID of user',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  id!: string

  @ApiProperty({
    description: 'Message about unsubscribe',
    default: 'user was unsubscribed',
  })
  message!: string

  @ApiProperty({
    description: 'Subscription Data in array',
    default: [
      {
        category: 'CITY',
        type: 'ANALYTICS',
        subType: 'unsubscribe',
      },
      {
        category: 'CITY',
        type: 'DATAPROCESSING',
        subType: 'unsubscribe',
      },
    ],
  })
  gdprData!: ResponseGdprLegalPersonDataDto[]

  @ApiProperty({
    description: 'Message about unsubscribe',
    default: 'user',
  })
  userData!: LegalPerson
}
