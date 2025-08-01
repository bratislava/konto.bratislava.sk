import { ApiProperty } from '@nestjs/swagger'

import { CustomErrorNorisTypesEnum } from '../../../noris/noris.errors'
import {
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
} from '../../../payment/dtos/error.dto'
import {
  CustomErrorPdfCreateTypesEnum,
  CustomErrorTaxTypesEnum,
} from '../../../tax/dtos/error.dto'

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
    enumName: 'CustomErrorEnums',
  })
  errorName: CustomErrorEnums
}

const errorSymbolNames = [
  'alert',
  'console',
  'errorType',
  'stack',
  'errorCause',
  'causedByMessage',
] as const

export const ErrorSymbols = Object.fromEntries(
  errorSymbolNames.map((name) => [name, Symbol(name)]),
) as { [K in (typeof errorSymbolNames)[number]]: symbol }

export const errorTypeKeys = Object.fromEntries(
  errorSymbolNames.map((name) => [name, `$Symbol-${name}`]),
) as Record<(typeof errorSymbolNames)[number], string>

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
  | CustomErrorNorisTypesEnum
