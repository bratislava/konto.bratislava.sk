import { baRjsfValidator } from './validators'
import { baDefaultFormStateBehavior } from './defaultFormState'

/**
 * Default RJSF props that should be used for all forms to work consistently.
 */
export const baFormDefaults = {
  validator: baRjsfValidator,
  experimental_defaultFormStateBehavior: baDefaultFormStateBehavior,
}
