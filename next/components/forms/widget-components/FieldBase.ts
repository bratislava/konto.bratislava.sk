import { ExplicitOptionalType } from '../types/ExplicitOptional'

export type FieldBaseProps = {
  label: string
  helptext?: string
  errorMessage?: string[]
  tooltip?: string
  required?: boolean
  disabled?: boolean
  explicitOptional?: ExplicitOptionalType
}
