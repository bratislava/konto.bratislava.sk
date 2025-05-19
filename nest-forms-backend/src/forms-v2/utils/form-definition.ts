import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

export function getFormDefinitionBySlugOrThrow(slug: string) {
  const formDefinition = getFormDefinitionBySlug(slug)
  if (!formDefinition) {
    throw new Error('TODO')
  }

  return formDefinition
}
