import { ApiProperty } from '@nestjs/swagger'

import { CustomErrorNorisTypesEnum } from '../../../noris/noris.errors'
import {
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
} from '../../../payment/dtos/error.dto'
import { CustomErrorTaxTypesEnum } from '../../../tax/dtos/error.dto'

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

export const ErrorSymbols = {
  alert: Symbol('alert'),
  console: Symbol('console'),
  errorType: Symbol('errorType'),
  stack: Symbol('stack'),
  errorCause: Symbol('errorCause'),
  causedByMessage: Symbol('causedByMessage'),
} as const

export const errorTypeKeys: Record<string, string> = {
  alert: `$Symbol-alert`,
  console: `$Symbol-console`,
  errorType: `$Symbol-errorType`,
  stack: `$Symbol-stack`,
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

export enum ErrorsEnum {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  BAD_GATEWAY_ERROR = 'BAD_GATEWAY_ERROR',
  BAD_GATEWAY_AUTH_ERROR = 'BAD_GATEWAY_AUTH_ERROR',
  SERVICE_UNAVAILABLE_ERROR = 'SERVICE_UNAVAILABLE_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
}

export enum ErrorsResponseEnum {
  NOT_FOUND_ERROR = 'Resource not found.',
  DATABASE_ERROR = 'There was database error.',
  INTERNAL_SERVER_ERROR = 'Internal server error.',
  UNAUTHORIZED_ERROR = 'Unauthorized.',
  UNPROCESSABLE_ENTITY_ERROR = 'Unprocessable entity.',
  BAD_REQUEST_ERROR = 'Bad request.',
  BAD_GATEWAY_ERROR = 'Bad gateway.',
  BAD_GATEWAY_AUTH_ERROR = 'Bad gateway: downstream rejected our credentials.',
  SERVICE_UNAVAILABLE_ERROR = 'Service unavailable.',
  FORBIDDEN_ERROR = 'Forbidden',
}

export type CustomErrorEnums =
  | ErrorsEnum
  | CustomErrorTaxTypesEnum
  | CustomErrorPaymentTypesEnum
  | CustomErrorPaymentResponseTypesEnum
  | CustomErrorNorisTypesEnum
