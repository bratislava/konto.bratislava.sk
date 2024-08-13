import { Schemas } from '../generator/functions'

export enum FormDefinitionType {
  SlovenskoSkGeneric = 'SlovenskoSkGeneric',
  SlovenskoSkTax = 'SlovenskoSkTax',
  Email = 'Email',
}

type FormDefinitionBase = {
  slug: string
  title: string
  schemas: Schemas
  termsAndConditions: string
  messageSubjectDefault: string
  messageSubjectFormat?: string
  embedded?: false | 'olo'
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
    ginisPersonName: string
  }
}
export type FormDefinitionSlovenskoSkTax = FormDefinitionSlovenskoSkBase & {
  type: FormDefinitionType.SlovenskoSkTax
}

export type FormDefinitionSlovenskoSk =
  | FormDefinitionSlovenskoSkGeneric
  | FormDefinitionSlovenskoSkTax

export type FormDefinitionEmail = FormDefinitionBase & {
  type: FormDefinitionType.Email
  email: string
}

export type FormDefinition =
  | FormDefinitionSlovenskoSkGeneric
  | FormDefinitionSlovenskoSkTax
  | FormDefinitionEmail

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
