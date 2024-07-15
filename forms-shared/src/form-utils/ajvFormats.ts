import { validate as validateUuid, version as uuidVersion } from 'uuid'

/**
 * Compares two time strings in format HH:MM.
 *
 * Copied from: https://github.com/ajv-validator/ajv-formats/blob/4dd65447575b35d0187c6b125383366969e6267e/src/formats.ts#L180C1-L186C2
 */
function compareTime(s1: string, s2: string): number | undefined {
  if (!(s1 && s2)) return undefined
  const t1 = new Date(`2020-01-01T${s1}`).valueOf()
  const t2 = new Date(`2020-01-01T${s2}`).valueOf()
  if (!(t1 && t2)) return undefined
  return t1 - t2
}

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

export const baAjvFormats = {
  zip: /\b\d{5}\b/,
  // https://blog.kevinchisholm.com/javascript/javascript-e164-phone-number-validation/
  'phone-number': /^\+[1-9]\d{10,14}$/,
  localTime: {
    // https://stackoverflow.com/a/51177696
    validate: /^(\d|0\d|1\d|2[0-3]):[0-5]\d$/,
    compare: compareTime,
  },
  ratio: {
    validate: (value: string) => parseRatio(value).isValid,
  },
  ico: /^\d{6,8}$/,
  'ba-file-uuid': {
    validate: validateBaFileUuid,
  },
}
