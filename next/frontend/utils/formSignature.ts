/**
 * Generates a date string in the format YYYYMMDDHHMMSS.
 * https://stackoverflow.com/questions/19448436/how-to-create-date-in-yyyymmddhhmmss-format-using-javascript#comment78307153_19448436
 */
const generateDate = () => new Date().toISOString().replace(/\D/g, '').slice(0, -3)

export const createFormSignatureId = (objectHash: string) => {
  return `object_${objectHash}_${generateDate()}`
}

export const parseObjectHashFromFormSignatureId = (formSignature: string) => {
  const signatureRegex = /^object_([\da-f]{40})_\d{14}$/
  const match = formSignature.match(signatureRegex)

  return match?.[1] ?? null
}
