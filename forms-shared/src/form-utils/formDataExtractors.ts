import { FormDefinition, FormDefinitionEmail } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { evaluateFormDataExtractor } from './evaluateFormDataExtractor'

export const extractFormSubjectPlain = (
  formDefinition: FormDefinition,
  formData: GenericObjectType | null,
) => {
  const extractPlainSubject = formDefinition.subject?.extractPlain
  const defaultSubject = formDefinition.title
  if (!extractPlainSubject || formData == null) {
    return defaultSubject
  }

  return evaluateFormDataExtractor(extractPlainSubject, formData, defaultSubject)
}

export const extractFormSubjectTechnical = (
  formDefinition: FormDefinition,
  formData: GenericObjectType | null,
) => {
  const extractTechnicalSubjectFn = formDefinition.subject?.extractTechnical
  const defaultSubject = formDefinition.title
  if (!extractTechnicalSubjectFn || formData == null) {
    return defaultSubject
  }

  return evaluateFormDataExtractor(extractTechnicalSubjectFn, formData)
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
