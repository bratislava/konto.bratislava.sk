import { FormDefinition, formDefinitions } from "../definitions/form-definitions";

export const getFormDefinitionBySlug = <T extends FormDefinition>(slug: string): T | null => {
  const formDefinition = formDefinitions.find(formDefinition => formDefinition.slug === slug)
  return formDefinition as T ?? null
}