"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeakMapRegistry = exports.createSingleUseValidatorRegistry = void 0;
const validators_1 = require("./validators");
/**
 * Creates a registry that returns a new validator instance for each call.
 * Used on backend where state isolation is important.
 */
const createSingleUseValidatorRegistry = () => {
    return {
        getValidator() {
            return (0, validators_1.getBaRjsfValidator)();
        },
    };
};
exports.createSingleUseValidatorRegistry = createSingleUseValidatorRegistry;
/**
 * Creates a registry that caches validators by schema reference.
 * Used on frontend to prevent repeated schema compilations when validating the same schema multiple times.
 */
const createWeakMapRegistry = () => {
    const validatorCache = new WeakMap();
    return {
        getValidator(schema) {
            let validator = validatorCache.get(schema);
            if (!validator) {
                validator = (0, validators_1.getBaRjsfValidator)();
                validatorCache.set(schema, validator);
            }
            return validator;
        },
    };
};
exports.createWeakMapRegistry = createWeakMapRegistry;
