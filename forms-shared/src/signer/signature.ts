import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { hashFormData } from './hashFormData'

export type FormSignature = {
  signatureBase64: string
  pospID: string
  pospVersion: string
  jsonVersion: string
  formDataHash: string
}

export const createFormSignature = (
  formDefinition: FormDefinitionSlovenskoSk,
  signatureBase64: string,
  formDataJson: GenericObjectType,
): FormSignature => {
  return {
    signatureBase64,
    pospID: formDefinition.pospID,
    pospVersion: formDefinition.pospVersion,
    jsonVersion: formDefinition.jsonVersion,
    formDataHash: hashFormData(formDataJson),
  }
}

export enum VerifyFormSignatureErrorType {
  FormDefinitionMismatch = 'FormDefinitionMismatch',
  FormDataHashMismatch = 'FormDataHashMismatch',
}

export class VerifyFormSignatureError extends Error {
  constructor(public type: VerifyFormSignatureErrorType) {
    super(type)
    this.name = 'VerifyFormSignatureError'
  }
}

export const verifyFormSignature = (
  formDefinition: FormDefinitionSlovenskoSk,
  formDataJson: GenericObjectType,
  formSignature: FormSignature,
): void => {
  if (
    formSignature.pospID !== formDefinition.pospID ||
    formSignature.pospVersion !== formDefinition.pospVersion ||
    formSignature.jsonVersion !== formDefinition.jsonVersion
  ) {
    throw new VerifyFormSignatureError(VerifyFormSignatureErrorType.FormDefinitionMismatch)
  }

  const currentHash = hashFormData(formDataJson)
  if (currentHash !== formSignature.formDataHash) {
    throw new VerifyFormSignatureError(VerifyFormSignatureErrorType.FormDataHashMismatch)
  }
}
