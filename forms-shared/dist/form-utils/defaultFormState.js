"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baGetDefaultFormStateStable = exports.baGetDefaultFormState = exports.baDefaultFormStateBehavior = exports.isFileMultipleSchema = void 0;
const utils_1 = require("@rjsf/utils");
const lodash_1 = require("lodash");
const fastMergeAllOf_1 = require("./fastMergeAllOf");
/**
 * Detects schema of `fileUpload` with `multiple: true`.
 *
 * e.g. `{ type: 'array', items: { type: 'string', file: true } }`
 */
const isFileMultipleSchema = (schema) => !Array.isArray(schema?.items) &&
    typeof schema?.items !== 'boolean' &&
    schema?.items?.file === true;
exports.isFileMultipleSchema = isFileMultipleSchema;
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
 *
 * `constAsDefaults` strategy:
 * According to JSON Schema spec, the only suitable value for const is the value itself, therefore RJSF adopted that
 * the const fields would be pre-filled with the value itself. This is not suitable for our use case, as we use the const
 * for agreement checkboxes and user has to explicitly check them.
 *
 * Context:
 * https://github.com/rjsf-team/react-jsonschema-form/issues/4344
 */
exports.baDefaultFormStateBehavior = {
    arrayMinItems: {
        populate: 'requiredOnly',
        computeSkipPopulate: (validator, schema) => (0, exports.isFileMultipleSchema)(schema),
    },
    allOf: 'populateDefaults',
    constAsDefaults: 'never',
};
const baGetDefaultFormState = (schema, formData, validatorRegistry, rootSchema) => (0, utils_1.getDefaultFormState)(validatorRegistry.getValidator(schema), schema, formData, rootSchema, undefined, exports.baDefaultFormStateBehavior, fastMergeAllOf_1.baFastMergeAllOf);
exports.baGetDefaultFormState = baGetDefaultFormState;
/**
 * `getDefaultFormState` adds only properties that can be immediately resolved, e.g. when there's a property that
 * relies on another property which is not yet present in the data, it won't be added. This function repeatedly calls
 * `getDefaultFormState` until the form state is stable.
 *
 * @remarks
 *
 * `maxIterations` is a safety measure to prevent infinite loops.
 */
const baGetDefaultFormStateStable = (schema, formData, validatorRegistry, rootSchema, maxIterations = 10) => {
    let currentFormData = formData;
    let iteration = 0;
    const validator = validatorRegistry.getValidator(schema);
    // For subsequent calls we want to reuse the same validator, so we create a new registry with the same validator
    const reuseValidatorRegistry = {
        getValidator: () => validator,
    };
    while (iteration < maxIterations) {
        const newFormData = (0, exports.baGetDefaultFormState)(schema, currentFormData, reuseValidatorRegistry, rootSchema);
        if ((0, lodash_1.isEqual)(currentFormData, newFormData)) {
            return newFormData;
        }
        currentFormData = newFormData;
        iteration++;
    }
    return currentFormData;
};
exports.baGetDefaultFormStateStable = baGetDefaultFormStateStable;
