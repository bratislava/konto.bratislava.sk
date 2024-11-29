"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSummary = void 0;
const fileStatus_1 = require("../form-files/fileStatus");
const validators_1 = require("../form-utils/validators");
const defaultFormState_1 = require("../form-utils/defaultFormState");
const checkPathForErrors_1 = require("./checkPathForErrors");
const ajvFormats_1 = require("../form-utils/ajvFormats");
/**
 * Validates the summary and returns error schema and info about files.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for Ajv. This is only one of few ways how
 * to traverse the form data for specific values. In this case, we extract the files we need to give a special attention
 * in summary.
 */
const validateSummary = (schema, formData, fileInfos, validatorRegistry) => {
    // When displaying summary, all the default data must be present to get correct error schema for each field, e.g. when
    // we have schema like this:
    //  - `wrapper` (object, required)
    //    - `field1` (string, required)
    //    - `field2` (string, optional)
    // but the initial data is `{}`, the error schema will be:
    // { property: 'wrapper', message: "must have required property 'wrapper'" }
    // if default data are added it correctly returns:
    // { property: 'wrapper.field1', message: "must have required property 'wrapper.field1'" }
    const defaultFormData = (0, defaultFormState_1.baGetDefaultFormStateStable)(schema, formData, validatorRegistry);
    const filesInFormData = [];
    const fileValidateFn = (schemaInner, id) => {
        if (!id) {
            return true;
        }
        if (!(0, ajvFormats_1.validateBaFileUuid)(id)) {
            return false;
        }
        const fileInfo = fileInfos[id];
        if (!fileInfo) {
            return false;
        }
        filesInFormData.push(fileInfo);
        return !(0, fileStatus_1.isErrorFileStatusType)(fileInfo.statusType);
    };
    const fileValidator = (0, validators_1.getFileValidatorBaRjsf)(fileValidateFn);
    const validationResults = fileValidator.validateFormData(defaultFormData, schema);
    const hasErrors = Object.keys(validationResults.errorSchema).length > 0;
    const pathHasError = (path) => (0, checkPathForErrors_1.checkPathForErrors)(path, validationResults.errorSchema);
    const getFileById = (id) => filesInFormData.find((file) => file.id === id);
    return {
        ...validationResults,
        hasErrors,
        pathHasError,
        filesInFormData,
        getFileById,
    };
};
exports.validateSummary = validateSummary;
