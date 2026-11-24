import { type GenericObjectType, omitExtraData, type RJSFSchema } from '@rjsf/utils'

import { BaRjsfValidatorRegistry } from './validatorRegistry'

/**
 * @remarks
 *
 * `schema` is also passed as the root schema (as in RJSF `Form`). RJSF itself would use a new `{}` for each call, so a
 * validator shared with code that uses `schema` as the root would swap its root schema back and forth, which discards
 * its compiled schemas (see `validatorRegistry.ts`).
 */
export function baOmitExtraData(
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
): GenericObjectType {
  const validator = validatorRegistry.getValidator(schema)

  return omitExtraData(validator, schema, schema, formData)
}
