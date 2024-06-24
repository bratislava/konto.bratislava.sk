import {
  FormDefinition,
  FormDefinitionEmail,
  formDefinitions,
  FormDefinitionSlovenskoSk,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionSlovenskoSkTax,
  FormDefinitionType,
} from './form-definitions'

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

export const getFormDefinitionBySlug = (slug: string): FormDefinition | null => {
  const formDefinition = formDefinitions.find((formDefinition) => formDefinition.slug === slug)
  return formDefinition ?? null
}
