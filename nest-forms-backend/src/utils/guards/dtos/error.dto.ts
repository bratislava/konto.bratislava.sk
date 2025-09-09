import { ConvertErrorsEnum } from '../../../convert/errors/convert.errors.enum'
import { FilesErrorsEnum } from '../../../files/files.errors.enum'
import { FormsErrorsEnum } from '../../../forms/forms.errors.enum'
import { GinisTaskErrorEnum } from '../../../ginis/errors/ginis-tasks.errors.enum'
import { NasesErrorsEnum } from '../../../nases/nases.errors.enum'
import { EmailFormsErrorsEnum } from '../../../nases-consumer/subservices/dtos/email-forms.errors.enum'
import { WebhookErrorsEnum } from '../../../nases-consumer/subservices/dtos/webhook.errors.enum'
import { ScannerClientErrorsEnum } from '../../../scanner-client/scanner-client.errors.enum'
import { SignerErrorsEnum } from '../../../signer/signer.errors.enum'
import { ErrorsEnum } from '../../global-enums/errors.enum'
import { MailgunErrorsEnum } from '../../global-enums/mailgun.errors.enum'
import { SharepointErrorsEnum } from '../../subservices/dtos/sharepoint.errors.enum'

export type CustomErrorEnums =
  | ErrorsEnum
  | FormsErrorsEnum
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

export class ErrorSymbols {
  static readonly alert: unique symbol = Symbol('alert')

  static readonly console: unique symbol = Symbol('console')

  static readonly errorType: unique symbol = Symbol('errorType')

  static readonly stack: unique symbol = Symbol('stack')

  static readonly errorCause = Symbol('errorCause')

  static readonly causedByMessage = Symbol('causedByMessage')

  static readonly causedByConsole = Symbol('causedByConsole')
}

export const errorTypeKeys: Record<string, string> = {
  alert: `$Symbol-alert`,
  console: `$Symbol-console`,
  errorType: `$Symbol-errorType`,
  stack: `$Symbol-stack`,
  errorCause: `$Symbol-errorCause`,
  causedByMessage: `$Symbol-causedByMessage`,
  causedByConsole: `$Symbol-causedByConsole`,
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

  [ErrorSymbols.causedByMessage]?: string;

  [ErrorSymbols.causedByConsole]?: string
}
