import { ErrorSchema } from '@rjsf/utils'

import { FormFileUploadFileInfo } from '../types/formFileUploadTypes'

/**
 * Check if a field or any of its children has errors. This is used to determine if a field should be highlighted in the
 * summary. By default, the library provides an `errorSchema` that contains the errors for each field. However, this
 * doesn't show the errors for the children of the field.
 *
 * E.g. for error schema:
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
 *
 * |                                     | Field error schema | Function return value |
 * |-------------------------------------|--------------------|-----------------------|
 * | root_inputStep_input                | yes                | true                  |
 * | root_fileUploadStep_multipleFiles   | no                 | *true*                |
 * | root_fileUploadStep_multipleFiles_0 | yes                | true                  |
 * | root_correctStep_input              | no                 | false                 |
 *
 */
export function checkPathForErrors(fieldId: string, errorSchema: ErrorSchema) {
  const fieldIdComponents = fieldId.split('_').slice(1)

  let current: ErrorSchema | undefined = errorSchema

  // Traverse the schema according to the path
  // eslint-disable-next-line no-restricted-syntax
  for (const component of fieldIdComponents) {
    if ((current as ErrorSchema)[component] === undefined) {
      // If a component of the path is not found in the schema, return false
      return false
    }
    current = (current as ErrorSchema)[component]
  }

  // Check if the final component in the path or any of its children has errors
  return true
}

export const formHasErrors = (errorSchema: ErrorSchema) => Object.keys(errorSchema).length > 0

/**
 * We want to disable submit button only in those cases, technically it is possible to send form with other errors,
 * but they are displayed in modal instead.
 */
export const isFormSubmitDisabled = (
  errorSchema: ErrorSchema,
  infectedFiles: FormFileUploadFileInfo[],
) => formHasErrors(errorSchema) || infectedFiles.length > 0
