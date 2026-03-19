import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

import { IsBirthNumber, IsIco, IsIdentityCard } from '../../utils/decorators/validation.decorators'
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
  @IsNumber()
  statusCode!: number

  @ApiProperty({
    description: 'status',
    default: 'OK',
  })
  @IsString()
  status!: string

  @ApiProperty({
    description: 'Message about update',
    default: ResponseVerificationIdentityCardMessageEnum.SEND_TO_QUEUE,
    enum: ResponseVerificationIdentityCardMessageEnum,
    enumName: 'ResponseVerificationIdentityCardMessageEnum',
  })
  @IsEnum(ResponseVerificationIdentityCardMessageEnum)
  message!: ResponseVerificationIdentityCardMessageEnum

  @ApiPropertyOptional({
    description: 'Error if exists',
    default: '',
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  @IsOptional()
  @IsEnum(VerificationErrorsEnum)
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
  @IsString()
  status!: string

  @ApiProperty({
    description: 'Message about error',
    default: 'Some detail about error',
  })
  @IsString()
  message!: string

  @ApiProperty({
    description: 'Error name for decoding.',
    default: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY,
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  @IsEnum(VerificationErrorsEnum)
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
  @IsNumber()
  statusCode!: number

  @ApiProperty({
    description: 'status',
    default: 'OK',
  })
  @IsString()
  status!: string

  @ApiProperty({
    description: 'Message about update',
    default: 'Tier was updated',
  })
  @IsString()
  message!: string

  @ApiPropertyOptional({
    description: 'Error if exists',
    default: '',
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  @IsOptional()
  @IsEnum(VerificationErrorsEnum)
  errorName?: VerificationErrorsEnum
}

export class ResponseCustomErrorVerificationEidDto {
  @ApiProperty({
    description: 'status',
    default: 'custom_error',
  })
  @IsString()
  status!: string

  @ApiProperty({
    description: 'Message about error',
    default: 'Some detail about error',
  })
  @IsString()
  message!: string

  @ApiProperty({
    description: 'Error name for decoding.',
    default: VerificationErrorsEnum.VERIFY_EID_ERROR,
    enum: VerificationErrorsEnum,
    enumName: 'VerificationErrorsEnum',
  })
  @IsEnum(VerificationErrorsEnum)
  errorName!: VerificationErrorsEnum
}

export class RequestBodyVerifyWithRpoDto {
  @ApiProperty({
    description: 'ico',
    example: '00000000',
  })
  @IsIco({
    message: 'Text must be Ico of length 6 to 8 character. Only numeric characters allowed.',
  })
  ico!: string

  @ApiProperty({
    description: "Birth number of legal entity's executive",
    example: '0000000011',
  })
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber!: string

  @ApiProperty({
    description: "Identity card of legal entity's executive",
    example: 'AB123456',
  })
  @IsIdentityCard({
    message: 'Text input must be a valid identity card.',
  })
  identityCard!: string

  @ApiProperty({
    description: 'Token returned by turnstile captcha',
    example: '',
  })
  turnstileToken!: string
}
