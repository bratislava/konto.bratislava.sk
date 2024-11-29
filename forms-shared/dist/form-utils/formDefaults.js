"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaFormDefaults = void 0;
const defaultFormState_1 = require("./defaultFormState");
const fastMergeAllOf_1 = require("./fastMergeAllOf");
/**
 * Default RJSF props that should be used for all forms to work consistently.
 */
const getBaFormDefaults = (schema, validatorRegistry) => ({
    validator: validatorRegistry.getValidator(schema),
    experimental_defaultFormStateBehavior: defaultFormState_1.baDefaultFormStateBehavior,
    experimental_customMergeAllOf: fastMergeAllOf_1.baFastMergeAllOf,
});
exports.getBaFormDefaults = getBaFormDefaults;
