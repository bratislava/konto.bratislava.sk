import { SchemaValidateFunction, Vocabulary } from 'ajv';
export declare const getBaRjsfValidator: (customKeywords?: Vocabulary) => import("@rjsf/validator-ajv8/lib/validator").default<any, import("@rjsf/utils").RJSFSchema, any>;
/**
 * The only reliable although hacky way how to traverse files in the form data is to provide keyword
 * with a custom validate function for AJV. This validator is used to work with the file UUIDs from the
 * form data.
 */
export declare const getFileValidatorBaRjsf: (fileValidateFn: SchemaValidateFunction) => import("@rjsf/validator-ajv8/lib/validator").default<any, import("@rjsf/utils").RJSFSchema, any>;
