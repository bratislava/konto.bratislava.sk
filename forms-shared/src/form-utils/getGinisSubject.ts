import { FormDefinitionSlovenskoSkGeneric } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'

export const getGinisSubject = (
  formDefinition: FormDefinitionSlovenskoSkGeneric,
  formData: GenericObjectType | null,
) => {
  const extractGinisSubject = formDefinition.ginisAssignment.extractGinisSubject
  if (!extractGinisSubject) {
    return formDefinition.title
  }

  return extractGinisSubject(formData) ?? formDefinition.title
}
