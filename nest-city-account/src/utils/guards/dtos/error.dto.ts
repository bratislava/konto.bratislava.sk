import { ErrorEnum } from '@bratislava/log-nest'
import { ApiProperty } from '@nestjs/swagger'

import { AdminErrorsEnum } from '../../../admin/admin.errors.enum'
import { CustomErrorAdminTypesEnum } from '../../../admin/dtos/error.dto'
import { MagproxyErrorsEnum } from '../../../magproxy/magproxy.errors.enum'
import { CustomErrorNorisTypesEnum } from '../../../noris/noris.errors'
import { TowingErrorsEnum } from '../../../towing/towing.errors.enum'
import { UserErrorsEnum } from '../../../user/user.error.enum'
import {
  SendToQueueErrorsEnum,
  VerificationErrorsEnum,
} from '../../../user-verification/verification.errors.enum'
import { DeliveryMethodErrorsEnum } from './delivery-method.error'

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
  | ErrorEnum
  | AdminErrorsEnum
  | SendToQueueErrorsEnum
  | DeliveryMethodErrorsEnum
  | CustomErrorAdminTypesEnum
  | CustomErrorNorisTypesEnum
  | TowingErrorsEnum

// Registers `CustomErrorEnums` as this app's error-enum union, so an injected
// `ErrorFactoryService` with no explicit generic is typed with it everywhere.
declare module '@bratislava/log-nest' {
  interface LogNestErrorEnumRegistry {
    errorEnum: CustomErrorEnums
  }
}
