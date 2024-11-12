import 'json-schema'
import { JSONSchema7 } from 'json-schema'

declare module 'json-schema' {
  export interface JSONSchema7 {
    file?: boolean
  }
}

export type BAJSONSchema7 = JSONSchema7

export const baAjvKeywords = [
  {
    keyword: 'file',
  },
  {
    keyword: 'uiOptions',
  },
]
