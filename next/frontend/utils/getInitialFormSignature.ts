import { validateExtractAsice } from 'forms-shared/signer/validateExtractAsice'

export async function getInitialFormSignature(base64Asice: string | null | undefined) {
  if (!base64Asice) {
    return null
  }

  try {
    const { formDataHash } = await validateExtractAsice(base64Asice)
    return {
      objectHash: formDataHash,
      signature: base64Asice,
    }
  } catch (error) {
    return null
  }
}
