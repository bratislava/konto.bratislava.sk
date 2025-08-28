import { ApiProperty } from '@nestjs/swagger'

import { UserErrorsEnum } from '../../../user/user.error.enum'
import {
  SendToQueueErrorsEnum,
  VerificationErrorsEnum,
} from '../../../user-verification/verification.errors.enum'
import { AdminErrorsEnum } from '../../../admin/admin.errors.enum'
import { MagproxyErrorsEnum } from '../../../magproxy/magproxy.errors.enum'
import { DeliveryMethodErrorsEnum } from './delivery-method.error'

// copied over from nest-forms-backend
export enum ErrorsEnum {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
}

export enum ErrorsResponseEnum {
  NOT_FOUND_ERROR = 'Not found',
  DATABASE_ERROR = 'Error to write or update or read from/to database',
  INTERNAL_SERVER_ERROR = 'Unexpected error',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
}

export class ResponseInternalServerErrorDto {
  @ApiProperty({
    description: 'statusCode',
    default: 500,
  })
  statusCode!: number

  @ApiProperty({
    description: 'Message about error',
    default: 'Internal server error',
  })
  message!: string
}

export type CustomErrorEnums =
  | UserErrorsEnum
  | VerificationErrorsEnum
  | MagproxyErrorsEnum
  | ErrorsEnum
  | AdminErrorsEnum
  | SendToQueueErrorsEnum
  | DeliveryMethodErrorsEnum

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
