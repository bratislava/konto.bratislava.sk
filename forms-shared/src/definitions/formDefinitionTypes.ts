import { MailgunTemplateEnum } from './emailFormTypes'
import { SharepointData } from './sharepointTypes'
import { GenericObjectType, type RJSFSchema } from '@rjsf/utils'

export enum FormDefinitionType {
  SlovenskoSkGeneric = 'SlovenskoSkGeneric',
  SlovenskoSkTax = 'SlovenskoSkTax',
  Email = 'Email',
  Webhook = 'Webhook',
}

type FormDefinitionBase = {
  slug: string
  title: string
  schema: RJSFSchema
  jsonVersion: string
  termsAndConditions: string
  messageSubjectDefault: string
  messageSubjectFormat?: string
  additionalInfoTemplate?: string
  embedded?: false | 'olo'
  allowSendingUnauthenticatedUsers?: boolean // Default should be false, so undefined must be handled as false
  exampleFormNotRequired?: boolean
}

type FormDefinitionSlovenskoSkBase = FormDefinitionBase & {
  pospID: string
  pospVersion: string
  publisher: string
  gestor: string
  isSigned: boolean
}

export type FormDefinitionSlovenskoSkGeneric = FormDefinitionSlovenskoSkBase & {
  type: FormDefinitionType.SlovenskoSkGeneric
  ginisAssignment: {
    ginisOrganizationName: string
    ginisPersonName?: string
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
    address: { test: string; prod: string } | string
    fromAddress?: { test: string; prod: string } | string // If undefined, the `address` value is used.
    newSubmissionTemplate: MailgunTemplateEnum
    userResponseTemplate: MailgunTemplateEnum
    sendJsonDataAttachmentInTechnicalMail?: boolean
    extractEmail: (formData: GenericObjectType) => string | undefined
    extractName?: (formData: GenericObjectType) => string | undefined
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
