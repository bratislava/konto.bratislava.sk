import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
} from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { evaluateFormDataExtractor } from './evaluateFormDataExtractor'

export const extractFormSubject = (
  formDefinition: FormDefinition,
  formData: GenericObjectType | null,
) => {
  const extractSubject = formDefinition.extractSubject
  const defaultSubject = formDefinition.title
  if (!extractSubject || formData == null) {
    return defaultSubject
  }

  return evaluateFormDataExtractor(extractSubject, formData, defaultSubject)
}

export const extractGinisSubject = (
  formDefinition: FormDefinitionSlovenskoSkGeneric,
  formData: GenericObjectType,
) => {
  const extractGinisSubjectFn = formDefinition.ginisAssignment.extractGinisSubject
  if (!extractGinisSubjectFn) {
    return formDefinition.title
  }

  return evaluateFormDataExtractor(extractGinisSubjectFn, formData)
}

export const extractEmailFormEmail = (
  formDefinition: FormDefinitionEmail,
  formData: GenericObjectType,
) => {
  return evaluateFormDataExtractor(formDefinition.email.extractEmail, formData)
}

export const extractEmailFormName = (
  formDefinition: FormDefinitionEmail,
  formData: GenericObjectType,
) => {
  const extractName = formDefinition.email.extractName
  if (!extractName) {
    return undefined
  }

  return evaluateFormDataExtractor(extractName, formData)
}
