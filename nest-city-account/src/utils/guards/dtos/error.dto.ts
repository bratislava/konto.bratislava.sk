import { ApiProperty } from '@nestjs/swagger'

import { AdminErrorsEnum } from '../../../admin/admin.errors.enum'
import { CustomErrorAdminTypesEnum } from '../../../admin/dtos/error.dto'
import { MagproxyErrorsEnum } from '../../../magproxy/magproxy.errors.enum'
import { CustomErrorNorisTypesEnum } from '../../../noris/noris.errors'
import { UserErrorsEnum } from '../../../user/user.error.enum'
import {
  SendToQueueErrorsEnum,
  VerificationErrorsEnum,
} from '../../../user-verification/verification.errors.enum'
import { DeliveryMethodErrorsEnum } from './delivery-method.error'

// copied over from nest-forms-backend
export enum ErrorsEnum {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  BAD_GATEWAY_ERROR = 'BAD_GATEWAY_ERROR',
  BAD_GATEWAY_AUTH_ERROR = 'BAD_GATEWAY_AUTH_ERROR',
  SERVICE_UNAVAILABLE_ERROR = 'SERVICE_UNAVAILABLE_ERROR',
}

export enum ErrorsResponseEnum {
  NOT_FOUND_ERROR = 'Resource not found.',
  DATABASE_ERROR = 'There was database error.',
  INTERNAL_SERVER_ERROR = 'Internal server error.',
  UNAUTHORIZED_ERROR = 'Unauthorized.',
  UNPROCESSABLE_ENTITY_ERROR = 'Unprocessable entity.',
  BAD_REQUEST_ERROR = 'Bad request.',
  FORBIDDEN_ERROR = 'Forbidden error',
  BAD_GATEWAY_ERROR = 'Bad gateway.',
  BAD_GATEWAY_AUTH_ERROR = 'Bad gateway: downstream rejected our credentials.',
  SERVICE_UNAVAILABLE_ERROR = 'Service unavailable.',
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
  | CustomErrorAdminTypesEnum
  | CustomErrorNorisTypesEnum

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
