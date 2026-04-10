import { MailgunTemplateEnum } from './emailFormTypes'
import { SharepointData } from './sharepointTypes'
import type { RJSFSchema } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import { FormSendPolicy } from '../send-policy/sendPolicy'
import {
  SchemaFormDataExtractor,
  SchemalessFormDataExtractor,
} from '../form-utils/evaluateFormDataExtractor'

export enum FormDefinitionType {
  SlovenskoSkGeneric = 'SlovenskoSkGeneric',
  SlovenskoSkTax = 'SlovenskoSkTax',
  Email = 'Email',
  Webhook = 'Webhook',
}

export type FileLimits<K extends Record<string, string> = Record<string, string>> = Record<
  K[keyof K],
  number
>

type FormDefinitionBase = {
  slug: string
  title: string
  schema: RJSFSchema
  jsonVersion: string
  sendPolicy: FormSendPolicy
  termsAndConditions: string
  subject?: {
    extractPlain?: SchemaFormDataExtractor<any>
    extractTechnical?: SchemalessFormDataExtractor<any>
  }
  additionalInfoTemplate?: string
  embedded?: false | 'olo'
  exampleFormNotRequired?: boolean
  feedbackLink?: string
  /**
   * Per-field file size limits. When set, the upload endpoint requires a `fieldId` query parameter
   * and enforces the limit for the matching field. Fields not listed fall back to `maxFileSize`.
   *
   * A field limit can only **restrict** below `maxFileSize` (or the global `MAX_FILE_SIZE`),
   * never exceed it — the effective limit is `min(fileLimits[fieldId].maxFileSize, maxFileSize, globalMaxFIle)`.
   */
  fileLimits?: FileLimits
  /** Max size of a single file in bytes. Falls back to global MAX_FILE_SIZE if not set. */
  maxFileSize?: number
  /** Max cumulative size of all active files on a form instance in bytes. No limit if not set. */
  maxTotalFileSize?: number
}

type FormDefinitionSlovenskoSkBase = FormDefinitionBase & {
  pospID: string
  pospVersion: string
  publisher: string
  isSigned: boolean
  skipGinisStateUpdate?: boolean
  /**
   * If true, the form does not have to be registered in production of slovensko.sk (e.g. test forms)
   */
  skipProductionRegistrationCheck?: boolean
}

export type FormDefinitionSlovenskoSkGeneric = FormDefinitionSlovenskoSkBase & {
  type: FormDefinitionType.SlovenskoSkGeneric
  ginisDocumentTypeId: string
  ginisAssignment: {
    ginisNodeId: string
    ginisFunctionId?: string
  }
  sharepointData?: SharepointData
}

export type FormDefinitionSlovenskoSkTax = FormDefinitionSlovenskoSkBase & {
  type: FormDefinitionType.SlovenskoSkTax
}

export type FormDefinitionWebhook = FormDefinitionBase & {
  type: FormDefinitionType.Webhook
  webhookUrl: string
}

export type FormDefinitionSlovenskoSk =
  | FormDefinitionSlovenskoSkGeneric
  | FormDefinitionSlovenskoSkTax

export type FormDefinitionEmail = FormDefinitionBase & {
  type: FormDefinitionType.Email
  email: {
    mailer: 'olo' | 'mailgun'
    address: {
      test: (string | SchemalessFormDataExtractor<any>)[]
      prod: (string | SchemalessFormDataExtractor<any>)[]
    }
    fromAddress: { test: string; prod: string }
    newSubmissionTemplate: MailgunTemplateEnum
    userResponseTemplate: MailgunTemplateEnum
    sendJsonDataAttachmentInTechnicalMail?: boolean
    extractEmail?: SchemalessFormDataExtractor<any>
    extractName?: SchemalessFormDataExtractor<any>
    technicalEmailSubjectAppendId?: boolean
  }
}

export type FormDefinition =
  | FormDefinitionSlovenskoSkGeneric
  | FormDefinitionSlovenskoSkTax
  | FormDefinitionEmail
  | FormDefinitionWebhook

export const isSlovenskoSkGenericFormDefinition = (
  formDefinition: FormDefinition,
): formDefinition is FormDefinitionSlovenskoSkGeneric =>
  formDefinition.type === FormDefinitionType.SlovenskoSkGeneric

export const isSlovenskoSkTaxFormDefinition = (
  formDefinition: FormDefinition,
): formDefinition is FormDefinitionSlovenskoSkTax =>
  formDefinition.type === FormDefinitionType.SlovenskoSkTax

export const isSlovenskoSkFormDefinition = (
  formDefinition: FormDefinition,
): formDefinition is FormDefinitionSlovenskoSk =>
  isSlovenskoSkGenericFormDefinition(formDefinition) ||
  isSlovenskoSkTaxFormDefinition(formDefinition)

export const isEmailFormDefinition = (
  formDefinition: FormDefinition,
): formDefinition is FormDefinitionEmail => formDefinition.type === FormDefinitionType.Email

export const isWebhookFormDefinition = (
  formDefinition: FormDefinition,
): formDefinition is FormDefinitionWebhook => formDefinition.type === FormDefinitionType.Webhook
