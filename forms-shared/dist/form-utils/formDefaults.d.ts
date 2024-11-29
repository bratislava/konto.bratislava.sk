import { baFastMergeAllOf } from './fastMergeAllOf';
import { BAJSONSchema7 } from './ajvKeywords';
import { BaRjsfValidatorRegistry } from './validatorRegistry';
/**
 * Default RJSF props that should be used for all forms to work consistently.
 */
export declare const getBaFormDefaults: (schema: BAJSONSchema7, validatorRegistry: BaRjsfValidatorRegistry) => {
    validator: import("@rjsf/validator-ajv8/lib/validator").default<any, import("@rjsf/utils").RJSFSchema, any>;
    experimental_defaultFormStateBehavior: import("@rjsf/utils").Experimental_DefaultFormStateBehavior;
    experimental_customMergeAllOf: typeof baFastMergeAllOf;
};
