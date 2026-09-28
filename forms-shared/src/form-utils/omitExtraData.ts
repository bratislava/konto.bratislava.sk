import type { GenericObjectType, RJSFSchema } from '@rjsf/utils'
import { BaRjsfValidatorRegistry } from './validatorRegistry'

import { omitExtraData } from '@rjsf/utils'

export function baOmitExtraData(
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
): GenericObjectType {
  const validator = validatorRegistry.getValidator(schema)

  return omitExtraData(validator, schema, undefined, formData)
}
