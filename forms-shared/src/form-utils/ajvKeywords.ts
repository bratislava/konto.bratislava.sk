import 'json-schema'
import { JSONSchema7 } from 'json-schema'
import { GenericObjectType } from '@rjsf/utils'

declare module 'json-schema' {
  export interface JSONSchema7 {
    file?: boolean
    baUiSchema?: GenericObjectType
    baOrder?: number
  }
}

export type BAJSONSchema7 = JSONSchema7

export const baAjvKeywords = [
  {
    keyword: 'file',
  },
  {
    keyword: 'baUiSchema',
  },
  {
    keyword: 'baOrder',
  },
]
