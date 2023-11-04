export type FieldSize = 'full' | 'medium' | 'small'

export type FieldBaseProps = {
  label: string
  helptext?: string
  errorMessage?: string[]
  tooltip?: string
  required?: boolean
  disabled?: boolean
  explicitOptional?: boolean
  readonly?: boolean
  size?: FieldSize
}

export type FieldAdditionalProps = {
  className?: string
  placeholder?: string
  // providing this 'prop' will disable error messages rendering inside this component
  customErrorPlace?: boolean
  width?: 'full' | 'fixed'
}
