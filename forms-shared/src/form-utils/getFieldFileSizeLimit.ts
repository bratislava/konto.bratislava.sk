import { FileLimits } from '../definitions/formDefinitionTypes'

/**
 * Looks up the per-field file size limit for the given field id
 * in the form definition's `fileLimits` dictionary.
 *
 * @param fileLimits - The form definition's `fileLimits` dictionary (may be undefined for forms without per-field limits).
 * @param fieldId - The field identifier as sent by the frontend (matches a key in the `fileLimits` dictionary).
 * @returns Max file size in bytes for this field, or `null` if no per-field limit is configured.
 */
export const getPerFieldFileLimit = (
  fileLimits: FileLimits | undefined,
  fieldId: string,
): number | null => {
  if (!fileLimits) {
    return null
  }

  return fileLimits[fieldId] ?? null
}
