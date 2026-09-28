import { type GenericObjectType, omitExtraData, type RJSFSchema } from '@rjsf/utils'

import { BaRjsfValidatorRegistry } from './validatorRegistry'

export function baOmitExtraData(
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
): GenericObjectType {
  const validator = validatorRegistry.getValidator(schema)

  return omitExtraData(validator, schema, undefined, formData)
}
