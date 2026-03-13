import type { FieldPathId } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}

export const getObjectFieldInfo = (fieldPathId: FieldPathId) => {
  const isFormObject = fieldPathId.path.length === 0
  const isStepObject = fieldPathId.path.length === 1
  const selfId =
    fieldPathId.path.length > 0 ? fieldPathId.path[fieldPathId.path.length - 1] : undefined
  const parentId =
    fieldPathId.path.length > 1 ? fieldPathId.path[fieldPathId.path.length - 2] : undefined
  const stepId = fieldPathId.path.length > 0 ? (fieldPathId.path[0] as string) : undefined

  return {
    id: fieldPathId.$id,
    path: fieldPathId.path,
    isFormObject,
    isStepObject,
    selfId,
    parentId,
    stepId,
  }
}
