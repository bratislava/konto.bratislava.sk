import {
  Experimental_DefaultFormStateBehavior,
  GenericObjectType,
  getDefaultFormState,
  RJSFSchema,
  ValidatorType,
} from '@rjsf/utils'

import { baRjsfValidator } from './validators'
import { isEqual } from 'lodash'

/**
 * Detects schema of `fileUpload` with `multiple: true`.
 *
 * e.g. `{ type: 'array', items: { type: 'string', file: true } }`
 */
export const isFileMultipleSchema = (schema: RJSFSchema) =>
  !Array.isArray(schema?.items) &&
  typeof schema?.items !== 'boolean' &&
  schema?.items?.file === true

/**
 * This is the most important setting for RJSF, make sure to pass it to all RJSF components / functions. Anytime user
 * open a form, to display proper fields the data are prefilled by the library.
 *
 * `arrayMinItems` strategy:
 *
 * Let's break it down for each field type (defined in /generator/functions.ts):
 *  - `arrayField` - this is the only field that we want to get populated with default data if it is required - e.g.
 *    when user opens a form that contains list of "Tax records" and at least one is required, we want to display empty
 *    "Tax record" (which is an object with another fields) initially for user not to click on "+ Add tax record" button
 *    unnecessarily.
 *  - `selectMultiple` & `checkboxGroup` - these fields would get prefilled with `requiredOnly` strategy, but RJSF
 *    implements a special `isMultiSelect` check that flags those to not prefill.
 *    https://github.com/rjsf-team/react-jsonschema-form/blob/294b9e3d37c96888a0e8bb3c68a5b2b1afd452bf/packages/utils/src/schema/getDefaultFormState.ts#L403
 *  - `fileUpload` with `multiple: true` - these fields would get prefilled with `requiredOnly` strategy and RJSF doesn't
 *    handle this case, therefore custom `computeSkipPopulate` is needed, in case this is not present, RJSF prefills it
 *    as `[null]` which is not correct and causes bugs.
 *    This needed to be implemented for this use case: https://github.com/rjsf-team/react-jsonschema-form/pull/4121
 *
 * Why other strategies are not suitable:
 *  - `populate: 'always'` - this would prefill even not required `arrayField` fields
 *  - `populate: 'never'` - this would prefill nothing
 *
 * If a new field type is added to the generator, this needs to be reflected here. See tests for expected behavior.
 *
 * `allOf` strategy:
 *
 * This was a bug in RJSF:
 * https://github.com/rjsf-team/react-jsonschema-form/issues/3892
 * https://github.com/rjsf-team/react-jsonschema-form/issues/3832
 *
 * This should be a default behavior, but the maintainers decided to keep it as an experimental feature as it would be
 * a breaking change.
 */
export const baDefaultFormStateBehavior: Experimental_DefaultFormStateBehavior = {
  arrayMinItems: {
    populate: 'requiredOnly',
    computeSkipPopulate: (validator, schema) => isFileMultipleSchema(schema),
  },
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

/**
 * `getDefaultFormState` adds only properties that can be immediately resolved, e.g. when there's a property that
 * relies on another property which is not yet present in the data, it won't be added. This function repeatedly calls
 * `getDefaultFormState` until the form state is stable.
 *
 * @remarks
 *
 * `maxIterations` is a safety measure to prevent infinite loops.
 */
export const baGetDefaultFormStateStable = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  rootSchema?: RJSFSchema,
  customValidator?: ValidatorType,
  maxIterations: number = 10,
) => {
  let currentFormData = formData
  let iteration = 0

  while (iteration < maxIterations) {
    const newFormData = baGetDefaultFormState(schema, currentFormData, rootSchema, customValidator)

    if (isEqual(currentFormData, newFormData)) {
      return newFormData
    }

    currentFormData = newFormData
    iteration++
  }

  return currentFormData
}
