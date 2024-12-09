import { ApiProperty } from '@nestjs/swagger'

import { UserErrorsEnum } from '../../../user/user.error.enum'
import {
  SendToQueueErrorsEnum,
  VerificationErrorsEnum,
} from '../../../user-verification/verification.errors.enum'
import { AdminErrorsEnum } from '../../../admin/admin.errors.enum'
import { MagproxyErrorsEnum } from '../../../magproxy/magproxy.errors.enum'

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

export class ResponseErrorDto {
  statusCode!: number

  status!: string

  message!: string

  errorName!: CustomErrorEnums

  $alert?: number

  object?: object | undefined

  $console?: string
}
