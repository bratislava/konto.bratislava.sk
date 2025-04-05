import { FormDefinition } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'

export const getFormSubject = (
  formDefinition: FormDefinition,
  formData: GenericObjectType | null,
) => {
  const extractSubject = formDefinition.extractSubject
  if (!extractSubject) {
    return formDefinition.title
  }

  return extractSubject(formData) ?? formDefinition.title
}
