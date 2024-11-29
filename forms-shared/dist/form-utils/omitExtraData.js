"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.omitExtraData = void 0;
const utils_1 = require("@rjsf/utils");
const core_1 = __importDefault(require("@rjsf/core"));
const defaultFormState_1 = require("./defaultFormState");
const fastMergeAllOf_1 = require("./fastMergeAllOf");
/**
 * Omits extra data from form data.
 *
 * Until https://github.com/rjsf-team/react-jsonschema-form/issues/4081 is resolved this is the only way how to omit
 * extra data from form data.
 */
function omitExtraData(schema, formData, validatorRegistry) {
    const validator = validatorRegistry.getValidator(schema);
    const schemaUtils = (0, utils_1.createSchemaUtils)(validator, schema, defaultFormState_1.baDefaultFormStateBehavior, fastMergeAllOf_1.baFastMergeAllOf);
    const formInstance = new core_1.default({ schema, validator });
    const retrievedSchema = schemaUtils.retrieveSchema(schema, formData);
    const pathSchema = schemaUtils.toPathSchema(retrievedSchema, undefined, formData);
    const fieldNames = formInstance.getFieldNames(pathSchema, formData);
    return formInstance.getUsedFormData(formData, fieldNames);
}
exports.omitExtraData = omitExtraData;
