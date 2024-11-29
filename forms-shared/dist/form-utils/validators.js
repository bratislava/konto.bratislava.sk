"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileValidatorBaRjsf = exports.getBaRjsfValidator = void 0;
const validator_ajv8_1 = require("@rjsf/validator-ajv8");
const ajvFormats_1 = require("./ajvFormats");
const ajvKeywords_1 = require("./ajvKeywords");
const getBaRjsfValidator = (customKeywords) => (0, validator_ajv8_1.customizeValidator)({
    // The type in @rjsf/validator-ajv8 is wrong.
    customFormats: ajvFormats_1.baAjvFormats,
    ajvOptionsOverrides: {
        keywords: customKeywords ?? ajvKeywords_1.baAjvKeywords,
    },
});
exports.getBaRjsfValidator = getBaRjsfValidator;
/**
 * Generates keywords with custom file validation function.
 */
const getFileValidatorBaAjvKeywords = (fileValidateFn) => {
    return ajvKeywords_1.baAjvKeywords.map((keyword) => {
        if (keyword.keyword === 'file') {
            return {
                ...keyword,
                validate: fileValidateFn,
            };
        }
        return keyword;
    });
};
/**
 * The only reliable although hacky way how to traverse files in the form data is to provide keyword
 * with a custom validate function for AJV. This validator is used to work with the file UUIDs from the
 * form data.
 */
const getFileValidatorBaRjsf = (fileValidateFn) => {
    return (0, exports.getBaRjsfValidator)(getFileValidatorBaAjvKeywords(fileValidateFn));
};
exports.getFileValidatorBaRjsf = getFileValidatorBaRjsf;
