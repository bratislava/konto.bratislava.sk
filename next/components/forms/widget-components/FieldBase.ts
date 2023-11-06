import { LabelSize } from 'schema-generator/generator/uiOptionsTypes'

export type FieldSize = 'full' | 'medium' | 'small'

export type FieldBaseProps = {
  label: string
  helptext?: string
  errorMessage?: string[]
  tooltip?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: FieldSize
  labelSize?: LabelSize
}

export type FieldAdditionalProps = {
  className?: string
  placeholder?: string
  // providing this 'prop' will disable error messages rendering inside this component
  customErrorPlace?: boolean
  width?: 'full' | 'fixed'
}
