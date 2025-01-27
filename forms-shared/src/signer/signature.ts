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
  rawSignatureBase64: string,
  formDataJson: GenericObjectType,
): FormSignature => {
  // Slovensko.sk cannot handle whitespace in the signature, also the validation on BE (IsBase64 from class-validator)
  // fails if there is whitespace. However, some signers return the signature with whitespace, so we remove it here.
  const signatureBase64 = rawSignatureBase64.replaceAll(/\s/g, '')

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
