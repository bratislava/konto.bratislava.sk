import { formDefinitions } from './form-definitions'
import { FormDefinition } from './formDefinitionTypes'

export const getFormDefinitionBySlug = (slug: string): FormDefinition | null => {
  const formDefinition = formDefinitions.find((formDefinition) => formDefinition.slug === slug)
  return formDefinition ?? null
}
