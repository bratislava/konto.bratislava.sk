import { validate as validateUuid, version as uuidVersion } from 'uuid'
import { electronicFormatIBAN, validateIBAN } from 'ibantools'
// https://stackoverflow.com/a/51177696
export const baTimeRegex = /^(\d|0\d|1\d|2[0-3]):[0-5]\d$/

/**
 * Compares two time strings in format HH:MM.
 *
 * Copied from: https://github.com/ajv-validator/ajv-formats/blob/4dd65447575b35d0187c6b125383366969e6267e/src/formats.ts#L180C1-L186C2
 */
function compareBaTime(s1: string, s2: string): number | undefined {
  if (!(s1 && s2)) return undefined
  const t1 = new Date(`2020-01-01T${s1}`).valueOf()
  const t2 = new Date(`2020-01-01T${s2}`).valueOf()
  if (!(t1 && t2)) return undefined
  return t1 - t2
}

// https://blog.kevinchisholm.com/javascript/javascript-e164-phone-number-validation/
export const baPhoneNumberRegex = /^\+[1-9]\d{10,14}$/

// https://github.com/mnestorov/regex-patterns?tab=readme-ov-file#slovakia
// But `libphonenumber` contains stricter validation rules:
// https://github.com/google/libphonenumber/blob/e3dbc4bde172a49d06e86b8305a7ca624e95cae8/resources/PhoneNumberMetadata.xml#L27018
export const baSlovakPhoneNumberRegex = /^\+421[1-9][0-9]{8}$/

export const parseRatio = (value: string) => {
  const ratioRegex = /^(0|[1-9]\d*)\/([1-9]\d*)$/
  if (!ratioRegex.test(value)) {
    return { isValid: false }
  }

  const parts = value.split('/')
  const numerator = parseInt(parts[0], 10)
  const denominator = parseInt(parts[1], 10)

  if (numerator > denominator) {
    return { isValid: false }
  }

  return { isValid: true, numerator, denominator }
}

export const validateBaFileUuid = (value: unknown): value is string => {
  return typeof value === 'string' && validateUuid(value) && uuidVersion(value) === 4
}

const baAjvInputFormats = {
  'ba-slovak-zip': /\b\d{5}\b/,
  'ba-phone-number': baPhoneNumberRegex,
  'ba-slovak-phone-number': baSlovakPhoneNumberRegex,
  'ba-ratio': {
    validate: (value: string) => parseRatio(value).isValid,
  },
  'ba-ico': /^\d{6,8}$/,
  'ba-iban': {
    validate: (value: string) => {
      const electronicFormat = electronicFormatIBAN(value)
      if (!electronicFormat) {
        return false
      }
      return validateIBAN(electronicFormat).valid
    },
  },
}

export type BaAjvInputFormat = keyof typeof baAjvInputFormats

const baAjvOtherFormats = {
  'ba-time': {
    // https://stackoverflow.com/a/51177696
    validate: baTimeRegex,
    compare: compareBaTime,
  },
  'ba-file-uuid': {
    validate: validateBaFileUuid,
  },
}

export const baAjvFormats = {
  ...baAjvInputFormats,
  ...baAjvOtherFormats,
}
