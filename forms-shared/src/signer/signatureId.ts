import { GenericObjectType } from '@rjsf/utils'
import { hashFormData } from './hashFormData'

/**
 * Generates a date string in the format YYYYMMDDHHMMSS.
 * https://stackoverflow.com/questions/19448436/how-to-create-date-in-yyyymmddhhmmss-format-using-javascript#comment78307153_19448436
 */
const generateDate = () => new Date().toISOString().replaceAll(/\D/g, '').slice(0, -3)

export const createFormSignatureId = (formData: GenericObjectType) => {
  const formDataHash = hashFormData(formData)

  return `form_data_${formDataHash}_${generateDate()}`
}

export const parseFormDataHashFromFormSignatureId = (formSignature: string) => {
  const signatureRegex = /^form_data_([\da-f]{40})_\d{14}$/
  const match = formSignature.match(signatureRegex)

  return match?.[1] ?? null
}