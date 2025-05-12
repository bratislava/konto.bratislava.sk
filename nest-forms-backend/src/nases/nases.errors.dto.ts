import { VerifyFormSignatureErrorType } from 'forms-shared/signer/signature'

import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'

export const verifyFormSignatureErrorMapping: Record<
  VerifyFormSignatureErrorType,
  { error: NasesErrorsEnum; message: NasesErrorsResponseEnum }
> = {
  [VerifyFormSignatureErrorType.FormDefinitionMismatch]: {
    error: NasesErrorsEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
    message: NasesErrorsResponseEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
  },
  [VerifyFormSignatureErrorType.FormDataHashMismatch]: {
    error: NasesErrorsEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
    message: NasesErrorsResponseEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
  },
}
