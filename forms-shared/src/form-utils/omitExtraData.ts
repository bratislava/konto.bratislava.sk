import type { GenericObjectType, RJSFSchema } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import { BaRjsfValidatorRegistry } from './validatorRegistry'

const { omitExtraData } = require('@rjsf/utils')

export function baOmitExtraData(
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
): GenericObjectType {
  const validator = validatorRegistry.getValidator(schema)

  return omitExtraData(validator, schema, undefined, formData)
}
