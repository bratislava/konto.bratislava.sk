export type FieldSize = 'full' | 'medium' | 'small'

export type FieldAdditionalProps = {
  className?: string
  placeholder?: string
  // providing this 'prop' will disable error messages rendering inside this component
  customErrorPlace?: boolean
  width?: 'full' | 'fixed'
}
