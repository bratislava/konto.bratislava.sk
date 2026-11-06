import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { IsBirthNumber, IsIdentityCard } from '../../utils/decorators/validation.decorators'
import { VerificationErrorsEnum } from '../verification.errors.enum'

export enum ResponseVerificationIdentityCardMessageEnum {
  SEND_TO_QUEUE = 'SendToQueue',
  ALREADY_VERIFIED = 'AlreadyVerified',
}

export class ResponseVerificationIdentityCardToQueueDto {
  @ApiProperty({
    description: 'number of status code',
    default: 200,
  })
  statusCode!: number

  @ApiProperty({
    description: 'status',
    default: 'OK',
  })
  status!: string

  @ApiProperty({
    description: 'Message about update',
    default: ResponseVerificationIdentityCardMessageEnum.SEND_TO_QUEUE,
    enum: ResponseVerificationIdentityCardMessageEnum,
    enumName: 'ResponseVerificationIdentityCardMessageEnum',
  })
  message!: ResponseVerificationIdentityCardMessageEnum

  @ApiPropertyOptional({
    description: 'Error if exists',
    default: '',
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  errorName?: VerificationErrorsEnum
}

export class RequestBodyVerifyIdentityCardDto {
  @ApiProperty({
    description: 'Birth number for check',
    example: '8808080000',
  })
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber!: string

  @ApiProperty({
    description: 'String of identity card',
    example: 'AB123456',
  })
  @IsIdentityCard({
    message: 'Text must be identity card number in format XX000000',
  })
  identityCard!: string

  @ApiProperty({
    description: 'Token returned by turnstile captcha',
    example: '',
  })
  turnstileToken!: string
}

export class ResponseCustomErrorVerificationIdentityCardDto {
  @ApiProperty({
    description: 'status',
    default: 'custom_error',
  })
  status!: string

  @ApiProperty({
    description: 'Message about error',
    default: 'Some detail about error',
  })
  message!: string

  @ApiProperty({
    description: 'Error name for decoding.',
    default: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY,
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  errorName!: VerificationErrorsEnum
}

export class ResponseNotFoundErrorVerificationIdentityCardDto {
  @ApiProperty({
    description: 'status',
    default: 'NotFound',
  })
  status!: string

  @ApiProperty({
    description: 'Message about error',
    default: 'This identity card number is not matching identity card for birthNumber',
  })
  message!: string

  @ApiProperty({
    description: 'Error name for decoding.',
    default: 'BIRTH_NUMBER_NOT_EXISTS',
  })
  errorName!: string
}

export class RequestBodyVerifyWithEidDto {
  @ApiProperty({
    description: 'Token returned by https://fix.slovensko-sk-api.bratislava.sk/login',
    example: '',
  })
  oboToken!: string
}

export class ResponseVerificationDto {
  @ApiProperty({
    description: 'number of status code',
    default: 200,
  })
  statusCode!: number

  @ApiProperty({
    description: 'status',
    default: 'OK',
  })
  status!: string

  @ApiProperty({
    description: 'Message about update',
    default: 'Tier was updated',
  })
  message!: string

  @ApiPropertyOptional({
    description: 'Error if exists',
    default: '',
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  errorName?: VerificationErrorsEnum
}

export class ResponseCustomErrorVerificationEidDto {
  @ApiProperty({
    description: 'status',
    default: 'custom_error',
  })
  status!: string

  @ApiProperty({
    description: 'Message about error',
    default: 'Some detail about error',
  })
  message!: string

  @ApiProperty({
    description: 'Error name for decoding.',
    default: VerificationErrorsEnum.VERIFY_EID_ERROR,
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  errorName!: VerificationErrorsEnum
}
