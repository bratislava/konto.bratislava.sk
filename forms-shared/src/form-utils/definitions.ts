import { FormDefinition, formDefinitions } from "../definitions/form-definitions";

export const getFormDefinitionBySlug = (slug: string): FormDefinition | null => {
  const formDefinition = formDefinitions.find(formDefinition => formDefinition.slug === slug)
  return formDefinition ?? null
}