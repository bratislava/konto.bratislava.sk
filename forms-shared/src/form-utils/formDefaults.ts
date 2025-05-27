import { baDefaultFormStateBehavior } from './defaultFormState'
import { baFastMergeAllOf } from './fastMergeAllOf'
import { BAJSONSchema7 } from './ajvKeywords'
import { BaRjsfValidatorRegistry } from './validatorRegistry'

/**
 * This is a default UI schema for all user-facing forms. All the UI schemas are now in the schema itself.
 * As we handle displaying errors in our own way, we hide the default error messages.
 */
export const defaultUiSchema = { 'ui:options': { hideError: true } }

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
