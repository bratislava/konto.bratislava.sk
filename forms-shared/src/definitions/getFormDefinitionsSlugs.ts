import { formDefinitions } from './formDefinitions'

type GetFormDefinitionsSlugsResult = { enabled: string[]; disabled: string[] }

export const getFormDefinitionsSlugs = (): GetFormDefinitionsSlugsResult => {
  return formDefinitions.reduce(
    (acc: GetFormDefinitionsSlugsResult, value) => {
      if (value.isDisabled) {
        acc.disabled.push(value.slug)
        return acc
      }

      acc.enabled.push(value.slug)
      return acc
    },
    { enabled: [], disabled: [] },
  )
}
