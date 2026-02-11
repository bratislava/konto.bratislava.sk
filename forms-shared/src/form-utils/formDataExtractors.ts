import { FormDefinition, FormDefinitionEmail } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { evaluateFormDataExtractor, SchemalessFormDataExtractor } from './evaluateFormDataExtractor'

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
  formData: GenericObjectType,
) => {
  const extractTechnicalSubjectFn = formDefinition.subject?.extractTechnical
  if (!extractTechnicalSubjectFn) {
    return formDefinition.title
  }

  return evaluateFormDataExtractor(extractTechnicalSubjectFn, formData)
}

export const extractEmailFormEmail = (
  formDefinition: FormDefinitionEmail,
  formData: GenericObjectType,
) => {
  const extractEmail = formDefinition.email.extractEmail
  if (!extractEmail) {
    return undefined
  }

  return evaluateFormDataExtractor(extractEmail, formData)
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

const evaluateRecipientEmailAddress = (
  address: string | SchemalessFormDataExtractor<any>,
  formData: GenericObjectType,
) => {
  if (typeof address === 'string') {
    return address
  }
  return evaluateFormDataExtractor(address, formData)
}

export const extractEmailFormAddress = (
  formDefinition: FormDefinitionEmail,
  formData: GenericObjectType,
) => {
  return {
    prod: formDefinition.email.address.prod.map((address) =>
      evaluateRecipientEmailAddress(address, formData),
    ),
    test: formDefinition.email.address.test.map((address) =>
      evaluateRecipientEmailAddress(address, formData),
    ),
  }
}
