import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { isEmailFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'

export const getEmailFormSlugs = () =>
  formDefinitions.filter(isEmailFormDefinition).map((formDefinition) => formDefinition.slug)
