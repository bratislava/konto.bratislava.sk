import { FileScanState } from '../../../../frontend/dtos/formStepperDto'

export interface TransformedFormData {
  label: string
  value: string | null
  schemaPath: string
  isError: boolean
  fileScanState?: FileScanState
  isConditional?: boolean
}

export interface TransformedFormStep {
  key: string
  label: string
  data: TransformedFormData[]
}
