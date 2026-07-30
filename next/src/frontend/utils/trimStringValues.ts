interface TrimStringValuesOptions {
  /**
   * Object keys for which the value (and its descendants) is left untrimmed, e.g. password fields
   * where a trailing space may be intentional and trimming would break login.
   */
  skippedKeys?: readonly string[]
}

/**
 * Recursively trims whitespace from every string value in an object, array or primitive.
 * Object keys are left untouched. Returns a new value and never mutates the input.
 *
 * Used as a safety net before form submit, mirroring the per-field trim done on blur
 * (see TextField/TextAreaField), since blur may not fire on every input (e.g. mobile autofill).
 */
const trimStringValues = <TValue>(value: TValue, options: TrimStringValuesOptions = {}): TValue => {
  if (typeof value === 'string') {
    return value.trim() as TValue
  }

  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) => trimStringValues(item, options)) as TValue
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        options.skippedKeys?.includes(key) ? entryValue : trimStringValues(entryValue, options),
      ]),
    ) as TValue
  }

  return value
}

export default trimStringValues
