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

export type FormFiles<SlotId extends string> = {
  /** Max size of a single file in bytes. Falls back to global MAX_FILE_SIZE if not set. */
  maxFileSize?: number
  /** Max cumulative size of all active files on a form instance in bytes. Falls back to global MAX_CUMULATIVE_FILE_SIZE if not set. */
  maxTotalFileSize?: number
  /**
   * Per-slot file size limits. When set, the upload endpoint requires a `slotId` query parameter
   * and enforces the limit for the matching slot. Slots not listed fall back to `maxFileSize`.
   *
   * A slot limit can only **restrict** below `maxFileSize` (or the global `MAX_FILE_SIZE`),
   * never exceed it — the effective limit is `min(slots[slotId].maxFileSize, maxFileSize, globalMaxFile)`.
   */
  slots: readonly {
    slotId: SlotId
    maxFileSize?: number
    maxTotalFileSize?: number
  }[]
}

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

  files?: FormFiles<string>
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
    replyToAddress?: { test: string; prod: string }
    sendJsonDataAttachmentInTechnicalMail?: boolean
    extractName?: SchemalessFormDataExtractor<any>
    technicalEmailSubjectAppendId?: boolean
  } & (
    | {
        /**
         * When extractEmail is provided, there is an option to enable reply-to header on technical
         * email to be set to extracted email, so admin replies go to the submitter instead of Konto.
         */
        extractEmail: SchemalessFormDataExtractor<any>
        technicalEmailReplyToExtractedEmail?: boolean
      }
    | {
        /**
         * When extractEmail is not provided, technicalEmailReplyToExtractedEmail CANNOT be provided
         */
        extractEmail?: never
        technicalEmailReplyToExtractedEmail?: never
      }
  )
}

export type FormDefinitionEmailWithExtractEmail = FormDefinitionEmail & {
  email: { extractEmail: SchemalessFormDataExtractor<any> }
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

/**
 * When `technicalEmailReplyToExtractedEmail` is `true`, the type guarantees `extractEmail` is set,
 * so the narrowed definition can be passed where a defined `extractEmail` is required.
 */
export const isFormDefinitionWithReplyToAndExtractEmail = (
  formDefinition: FormDefinitionEmail,
): formDefinition is FormDefinitionEmailWithExtractEmail =>
  formDefinition.email.technicalEmailReplyToExtractedEmail === true
