import type { RJSFSchema } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}

const collectRecursive = (node: unknown, acc: string[]) => {
  if (node === null || typeof node !== 'object') {
    return
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectRecursive(item, acc)
    }
    return
  }

  const record = node as Record<string, unknown>
  const baUiSchema = record.baUiSchema
  if (baUiSchema && typeof baUiSchema === 'object') {
    const slot = (baUiSchema as Record<string, unknown>)['ui:slot']
    if (typeof slot === 'string') {
      acc.push(slot)
    }
  }

  for (const value of Object.values(record)) {
    collectRecursive(value, acc)
  }
}

/**
 * Walks the generated form schema and returns every `ui:slot` value found on file fields.
 * Used to verify each `ui:slot` in a schema is declared in the form definition's `files.slots`.
 */
export const collectSchemaFileSlots = (schema: RJSFSchema): string[] => {
  const slots: string[] = []
  collectRecursive(schema, slots)
  return slots
}
