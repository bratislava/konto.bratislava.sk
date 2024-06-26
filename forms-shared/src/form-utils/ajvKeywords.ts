import 'json-schema'
import { JSONSchema7 } from 'json-schema'
declare module 'json-schema' {
  export interface JSONSchema7 {
    pospID?: string
    pospVersion?: string
    slug?: string
    hash?: string
    stepperTitle?: string
    file?: boolean
  }
}

export type BAJSONSchema7 = JSONSchema7

export const baAjvKeywords = [
  // Root schema
  {
    keyword: 'pospID',
  },
  {
    keyword: 'pospVersion',
  },
  {
    keyword: 'slug',
  },
  // Step schema
  {
    keyword: 'hash',
  },
  {
    keyword: 'stepperTitle',
  },
  // File field schema
  {
    keyword: 'file',
  },
]
