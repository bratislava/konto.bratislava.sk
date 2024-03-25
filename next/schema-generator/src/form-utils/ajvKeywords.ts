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
