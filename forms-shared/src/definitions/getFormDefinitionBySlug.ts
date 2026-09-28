import { devFormDefinitions } from './devFormDefinitions'
import { formDefinitions } from './formDefinitions'
import { FormDefinition } from './formDefinitionTypes'

export const getFormDefinitionBySlug = (slug: string): FormDefinition | null => {
  const formDefinition = formDefinitions.find((formDefinition) => formDefinition.slug === slug)
  return formDefinition ?? null
}

export const getFormDefinitionBySlugDev = (slug: string): FormDefinition | null => {
  const mergedFormDefinitions = [...formDefinitions, ...devFormDefinitions]
  const formDefinition = mergedFormDefinitions.find(
    (formDefinition) => formDefinition.slug === slug,
  )
  return formDefinition ?? null
}
