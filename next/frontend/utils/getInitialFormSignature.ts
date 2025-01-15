import { validateExtractAsice } from 'forms-shared/signer/validateExtractAsice'

import type { FormSignature } from '../../components/forms/signer/useFormSignature'

export async function getInitialFormSignature(base64Asice: string | null | undefined) {
  if (!base64Asice) {
    return null
  }

  try {
    const { formDataHash } = await validateExtractAsice(base64Asice)
    return {
      formDataHash,
      signature: base64Asice,
    } satisfies FormSignature
  } catch (error) {
    return null
  }
}
