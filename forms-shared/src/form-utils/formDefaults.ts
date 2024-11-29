import { baDefaultFormStateBehavior } from './defaultFormState'
import { baFastMergeAllOf } from './fastMergeAllOf'
import { BAJSONSchema7 } from './ajvKeywords'
import { BaRjsfValidatorRegistry } from './validatorRegistry'

/**
 * Default RJSF props that should be used for all forms to work consistently.
 */
export const getBaFormDefaults = (
  schema: BAJSONSchema7,
  validatorRegistry: BaRjsfValidatorRegistry,
) => ({
  validator: validatorRegistry.getValidator(schema),
  experimental_defaultFormStateBehavior: baDefaultFormStateBehavior,
  experimental_customMergeAllOf: baFastMergeAllOf,
})
