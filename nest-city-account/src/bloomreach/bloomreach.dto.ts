import { ApiProperty } from '@nestjs/swagger'

export enum BloomreachEventNameEnum {
  CONSENT = 'consent',
}

export enum BloomreachConsentActionEnum {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export enum BloomreachConsentCategoryEnum {
  ESBS_LICENSE = 'ESBS-LICENSE',
  ESBS_MARKETING = 'ESBS-MARKETING',
  TAX_COMMUNICATION = 'TAX-COMMUNICATION',
  OTHER = 'Other',
}

/**
 * Marks the state of anonymization of a user in bloomreach.
 * - NOT_FOUND = The user was not found in bloomreach.
 * - NOT_ACTIVE = Bloomreach integration state is not active.
 * - ERROR = There has been an unknown error. Check logs.
 * - SUCCESS = The user has been successfuly anonymized in bloomreach.
 */
export enum AnonymizeResponse {
  NOT_FOUND = 'NOT_FOUND',
  NOT_ACTIVE = 'NOT_ACTIVE',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export class ConsentBloomreachDataDto {
  @ApiProperty({
    description: 'Is it subscribed or not?',
    example: BloomreachConsentActionEnum.ACCEPT,
    enum: BloomreachConsentActionEnum,
    enumName: 'BloomreachConsentActionEnum',
  })
  action: BloomreachConsentActionEnum

  @ApiProperty({
    description: 'Category of consent',
    example: BloomreachConsentCategoryEnum.ESBS_LICENSE,
  })
  category: BloomreachConsentCategoryEnum | string

  @ApiProperty({
    description: 'Timestamp of end of validity of consent. It is Datetime or Date or "unlimited"',
    example: BloomreachConsentCategoryEnum.ESBS_LICENSE,
  })
  valid_until: string
}
