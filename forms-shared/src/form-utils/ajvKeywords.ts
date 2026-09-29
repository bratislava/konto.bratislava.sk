import type { GenericObjectType } from '@rjsf/utils'
import { JSONSchema7 } from 'json-schema'

declare module 'json-schema' {
  export interface JSONSchema7 {
    baFile?: boolean
    baUiSchema?: GenericObjectType
    baOrder?: number
  }
}

export type BAJSONSchema7 = JSONSchema7

export const baAjvKeywords = [
  {
    keyword: 'baFile',
  },
  {
    keyword: 'baUiSchema',
  },
  {
    keyword: 'baOrder',
  },
]
