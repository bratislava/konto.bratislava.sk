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
}

type FormDefinitionSlovenskoSkBase = FormDefinitionBase & {
  slovenskoSkUrl: string
  pospID: string
  pospVersion: string
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
