import type { RJSFSchema } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import traverse from 'traverse'
import { FileUploadUiOptions } from '../generator/uiOptionsTypes'

/**
 * Walks the generated form schema and returns every file upload `slotId` found in `baUiSchema.ui:options`.
 * Used to verify each schema slot is declared in the form definition's `files.slots`.
 */
export const collectSchemaFileSlots = (schema: RJSFSchema): string[] => {
  return traverse(schema).reduce(function traverseFn(acc: string[], value) {
    if (this.key !== 'baUiSchema' || value === null || typeof value !== 'object' || Array.isArray(value)) {
      return acc
    }

    const baUiSchema = value as {'ui:widget': string, 'ui:options': Record<string, any> }
    const uiWidget = baUiSchema['ui:widget'];
    if (uiWidget !== 'FileUpload' && uiWidget !== 'FileUploadMultiple') {
      return acc
    }

    acc.push(((baUiSchema['ui:options'] as FileUploadUiOptions).slotId))

    return acc
  }, []) as string[]
}
