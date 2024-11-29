"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPathForErrors = void 0;
/**
 * Checks if a field or any of its children has errors. This is used to determine if a field should be highlighted in the
 * summary. By default, the library provides an `errorSchema` that contains the errors for each field. However, this
 * doesn't show the errors for the children of the field.
 *
 * @example
 * Given an error schema:
 * ```
 * {
 *   inputStep: {
 *     input: {
 *       _errors: ['error message']
 *     }
 *   },
 *   fileUploadStep: {
 *     multipleFiles: {
 *       0: {
 *         _errors: ['error message']
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * |                                     | Field error schema | Function return value |
 * |-------------------------------------|--------------------|-----------------------|
 * | root_inputStep_input                | yes                | true                  |
 * | root_fileUploadStep_multipleFiles   | no                 | *true*                |
 * | root_fileUploadStep_multipleFiles_0 | yes                | true                  |
 * | root_correctStep_input              | no                 | false                 |
 *
 */
function checkPathForErrors(fieldId, errorSchema) {
    const splitFieldId = fieldId.split('_');
    if (splitFieldId[0] !== 'root') {
        throw new Error('Field ID must start with "root"');
    }
    const fieldIdComponents = splitFieldId.slice(1);
    let current = errorSchema;
    // Traverse the schema according to the path
    // eslint-disable-next-line no-restricted-syntax
    for (const component of fieldIdComponents) {
        if (current[component] === undefined) {
            // If a component of the path is not found in the schema, return false
            return false;
        }
        current = current[component];
    }
    // Check if the final component in the path or any of its children has errors
    return true;
}
exports.checkPathForErrors = checkPathForErrors;
