export interface TransformedFormData {
  label: string
  value: string
  schemaPath: string
  isError: boolean
  isConditional?: boolean
}

export interface TransformedFormStep {
  key: string
  label: string
  data: TransformedFormData[]
}
