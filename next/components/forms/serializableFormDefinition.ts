import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'

type RemoveFunctions<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K]
}

export type SerializableFormDefinition = RemoveFunctions<FormDefinition>

export const makeSerializableFormDefinition = (
  formDefinition: FormDefinition,
): SerializableFormDefinition => {
  const entries = Object.entries(formDefinition)
  const filteredEntries = entries.filter(([, value]) => typeof value !== 'function')

  return Object.fromEntries(filteredEntries) as SerializableFormDefinition
}

export const makeSerializableFormDefinitionArray = (
  formDefinitions: FormDefinition[],
): SerializableFormDefinition[] => formDefinitions.map(makeSerializableFormDefinition)
