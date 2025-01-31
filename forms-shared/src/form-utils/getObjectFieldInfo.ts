import { IdSchema } from '@rjsf/utils'

export const getObjectFieldInfo = (idSchema: IdSchema) => {
  const id = idSchema.$id
  const splitId = id.split('_')
  const isFormObject = splitId.length === 1 && splitId[0] === 'root'
  const isStepObject = splitId.length === 2 && splitId[0] === 'root'
  const selfId = splitId[splitId.length - 1]

  return {
    id,
    splitId,
    isFormObject,
    isStepObject,
    selfId,
  }
}
