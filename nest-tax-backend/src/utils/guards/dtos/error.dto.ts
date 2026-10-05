import { ErrorEnum } from '@bratislava/log-nest'
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

  // eslint-disable-next-line @darraghor/nestjs-typed/api-enum-property-best-practices -- CustomErrorEnums is a union of multiple enums, not a single enum value, so it cannot be passed to `enum:`
  @ApiProperty({
    description: 'Name of the error',
    default: 'INTERNAL_SERVER_ERROR',
    enumName: 'CustomErrorEnums',
  })
  errorName: CustomErrorEnums
}

export type CustomErrorEnums =
  | ErrorEnum
  | CustomErrorTaxTypesEnum
  | CustomErrorPaymentTypesEnum
  | CustomErrorPaymentResponseTypesEnum
  | CustomErrorNorisTypesEnum

// Registers `CustomErrorEnums` as this app's error-enum union, so an injected
// `ErrorFactoryService` with no explicit generic is typed with it everywhere.
declare module '@bratislava/log-nest' {
  interface LogNestErrorEnumRegistry {
    errorEnum: CustomErrorEnums
  }
}
