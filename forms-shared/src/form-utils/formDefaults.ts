import { baRjsfValidator } from './validators'
import { baDefaultFormStateBehavior } from './defaultFormState'
import { baFastMergeAllOf } from './fastMergeAllOf'

/**
 * Default RJSF props that should be used for all forms to work consistently.
 */
export const baFormDefaults = {
  validator: baRjsfValidator,
  experimental_defaultFormStateBehavior: baDefaultFormStateBehavior,
  experimental_customMergeAllOf: baFastMergeAllOf,
}
