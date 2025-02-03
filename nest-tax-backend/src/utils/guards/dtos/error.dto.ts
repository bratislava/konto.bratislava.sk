import { ApiProperty } from '@nestjs/swagger'

export class ResponseInternalServerErrorDto {
  @ApiProperty({
    description: 'statusCode',
    default: 500,
  })
  statusCode: number

  @ApiProperty({
    description: 'Message about error',
    default: 'Internal server error',
  })
  message: string
}

export class ResponseErrorDto {
  @ApiProperty({
    description: 'statusCode',
    default: 500,
  })
  statusCode: number

  @ApiProperty({
    description: 'status',
    default: 'Internal server error',
  })
  status: string

  @ApiProperty({
    description: 'Message about error',
    default: 'Internal server error',
  })
  message: string

  @ApiProperty({
    description: 'Name of the error',
    default: 'INTERNAL_SERVER_ERROR',
    enumName: 'CustomErrorPaymentTypesEnum',
  })
  errorName: CustomErrorPaymentTypesEnum
}

export class ErrorSymbols {
  static readonly alert: unique symbol = Symbol('alert')

  static readonly console: unique symbol = Symbol('console')

  static readonly errorType: unique symbol = Symbol('errorType')

  static readonly stack: unique symbol = Symbol('stack')

  static readonly field: unique symbol = Symbol('field')

  static readonly errorCause = Symbol('errorCause')

  static readonly causedByMessage = Symbol('causedByMessage')
}

export const errorTypeKeys: Record<string, string> = {
  alert: `$Symbol-alert`,
  console: `$Symbol-console`,
  errorType: `$Symbol-errorType`,
  stack: `$Symbol-stack`,
  field: `$Symbol-field`,
  errorCause: `$Symbol-errorCause`,
  causedByMessage: `$Symbol-causedByMessage`,
}

export const errorTypeStrings = Object.values(errorTypeKeys)

export class ResponseErrorInternalDto {
  statusCode!: number

  status!: string

  message!: string

  errorName!: CustomErrorEnums;

  [ErrorSymbols.alert]?: number;

  [ErrorSymbols.console]?: string;

  [ErrorSymbols.errorCause]?: string;

  [ErrorSymbols.causedByMessage]?: string
}

export enum CustomErrorTaxTypesEnum {
  TAXYEAR_OR_USER_NOT_FOUND = 'TAXYEAR_OR_USER_NOT_FOUND',
  BIRTNUMBER_NOT_EXISTS = 'BIRTNUMBER_NOT_EXISTS',
}

export enum CustomErrorTaxTypesResponseEnum {
  TAXYEAR_OR_USER_NOT_FOUND = 'Tax year or user was not found',
  BIRTNUMBER_NOT_EXISTS = 'Birthnumber not exists',
}

export enum CustomErrorPaymentTypesEnum {
  TAX_NOT_FOUND = 'TAX_NOT_FOUND',
  PAYMENT_ALREADY_PAYED = 'PAYMENT_ALREADY_PAYED',
  OLD_TAX_NOT_PAYABLE = 'OLD_TAX_NOT_PAYABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CREATE_PAYMENT_URL = 'CREATE_PAYMENT_URL',
  QR_CODE_NOT_FOUND = 'QR_CODE_NOT_FOUND',
}

export enum CustomErrorPaymentTypesResponseEnum {
  OLD_TAX_NOT_PAYABLE = 'Tax is not payable, because tax is from past year.',
  QR_CODE_NOT_FOUND = 'QR code was not found',
}

export enum CustomErrorPaymentResponseTypesEnum {
  PAYMENT_RESPONSE_ERROR = 'PAYMENT_RESPONSE_ERROR',
}

export enum CustomErrorPdfCreateTypesEnum {
  PDF_CREATE_ERROR = 'PDF_CREATE_ERROR',
}

export enum ErrorsEnum {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
}

export enum ErrorsResponseEnum {
  NOT_FOUND_ERROR = 'Not found',
  DATABASE_ERROR = 'Error to write or update or read from/to database',
  INTERNAL_SERVER_ERROR = 'Unexpected error',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  FORBIDDEN_ERROR = 'Forbidden',
}

export type CustomErrorEnums =
  | ErrorsEnum
  | CustomErrorTaxTypesEnum
  | CustomErrorPaymentTypesEnum
  | CustomErrorPaymentResponseTypesEnum
  | CustomErrorPdfCreateTypesEnum
