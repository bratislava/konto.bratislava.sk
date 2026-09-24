import { ErrorEnum } from '@bratislava/log-nest'

import { CityAccountErrorsEnum } from '../../../auth/errors/city-account.errors.enum'
import { ConvertErrorsEnum } from '../../../convert/errors/convert.errors.enum'
import { FilesErrorsEnum } from '../../../files/files.errors.enum'
import { EmailFormsErrorsEnum } from '../../../form-delivery-consumer/errors/email-forms.errors.enum'
import { FormDeliveryConsumerErrorsEnum } from '../../../form-delivery-consumer/errors/form-delivery-consumer.errors.enum'
import { WebhookErrorsEnum } from '../../../form-delivery-consumer/errors/webhook.errors.enum'
import { FormSenderErrorsEnum } from '../../../form-sender/form-sender.errors.enum'
import { FormsErrorsEnum } from '../../../forms/forms.errors.enum'
import { GinisTaskErrorEnum } from '../../../ginis/errors/ginis-tasks.errors.enum'
import { NasesErrorsEnum } from '../../../nases/nases.errors.enum'
import { ScannerClientErrorsEnum } from '../../../scanner-client/scanner-client.errors.enum'
import { SignerErrorsEnum } from '../../../signer/signer.errors.enum'
import { StatusErrorsEnum } from '../../../status/errors/status.errors.enum'
import { MailgunErrorsEnum } from '../../global-enums/mailgun.errors.enum'
import { SharepointErrorsEnum } from '../../subservices/dtos/sharepoint.errors.enum'

export type CustomErrorEnums =
  | ErrorEnum
  | FormsErrorsEnum
  | FormDeliveryConsumerErrorsEnum
  | GinisTaskErrorEnum
  | NasesErrorsEnum
  | MailgunErrorsEnum
  | SharepointErrorsEnum
  | FilesErrorsEnum
  | EmailFormsErrorsEnum
  | WebhookErrorsEnum
  | ScannerClientErrorsEnum
  | ConvertErrorsEnum
  | SignerErrorsEnum
  | StatusErrorsEnum
  | CityAccountErrorsEnum
  | FormSenderErrorsEnum

// Registers `CustomErrorEnums` as this app's error-enum union, so an injected
// `ErrorFactoryService` with no explicit generic is typed with it everywhere.
declare module '@bratislava/log-nest' {
  interface LogNestErrorEnumRegistry {
    errorEnum: CustomErrorEnums
  }
}
