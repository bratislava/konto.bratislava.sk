import { ErrorSchema } from '@rjsf/utils';
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
export declare function checkPathForErrors(fieldId: string, errorSchema: ErrorSchema): boolean;
