import { ApiProperty } from '@nestjs/swagger'

import { ResponseConsentDto } from './gdpr.user.dto'

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
  createdAt!: Date

  @ApiProperty({
    description: 'Last updated timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  updatedAt!: Date

  @ApiProperty({
    description: 'Id from cognito',
    default: 'e51754f2-3367-43f6-b9bc-b5c6131b041a',
  })
  externalId: string

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
    description: 'Current consent state for the legal person, one entry per consent type.',
    type: [ResponseConsentDto],
    default: [
      { consentType: 'MARKETING', isGranted: true },
      { consentType: 'GENERAL', isGranted: true },
    ],
  })
  consents!: ResponseConsentDto[]
}
