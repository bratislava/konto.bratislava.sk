import {
  Experimental_DefaultFormStateBehavior,
  GenericObjectType,
  getDefaultFormState,
  RJSFSchema,
  ValidatorType,
} from '@rjsf/utils'

import { baRjsfValidator } from './validators'

/**
 * This is a custom prop that is passed to RJSF components / functions. Make sure to pass it to all
 * of them to ensure consistent behaviour.
 *
 * The default behaviour of RJSF is to prefill all the arrays with minKeys value, with default or
 * `null` value. For most of our use-cases this doesn't make sense. As multiple file upload, select
 * with multiple options or checkbox groups are arrays, e.g. them having minKeys of 1 would make
 * RJSF to prefill them which would result to `[null]` value which is not correct.
 *
 * Unfortunately, there are cases where this behaviour is needed. For example, array fields contain
 * a list of objects, not prefilling them would require user to manually click "Add" button to add
 * the first item. This is not a good UX. Therefore, we implemented a patch that allows us to
 * override this behaviour for specific fields using `overrideArrayMinItemsBehaviour` keyword.
 */
export const baDefaultFormStateBehavior: Experimental_DefaultFormStateBehavior = {
  arrayMinItems: { populate: 'never' },
  // https://github.com/rjsf-team/react-jsonschema-form/issues/3832
  // https://github.com/rjsf-team/react-jsonschema-form/issues/3892
  allOf: 'populateDefaults',
}

export const baGetDefaultFormState = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  rootSchema?: RJSFSchema,
  customValidator?: ValidatorType,
) =>
  getDefaultFormState(
    customValidator ?? baRjsfValidator,
    schema,
    formData,
    rootSchema,
    undefined,
    baDefaultFormStateBehavior,
  )
