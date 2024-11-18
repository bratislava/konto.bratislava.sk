import { DOMAttributes } from 'react'

import FieldErrorMessage, { FieldErrorMessageProps } from './FieldErrorMessage'
import FieldHelptext from './FieldHelptext'

export type FieldFooterProps = FieldErrorMessageProps & {
  helptextFooter?: string
  disabled?: boolean
  customErrorPlace?: boolean
  descriptionProps?: DOMAttributes<never>
}

const FieldFooter = ({
  helptextFooter,
  descriptionProps,
  disabled,
  customErrorPlace,
  errorMessage,
  errorMessageProps,
}: FieldFooterProps) => {
  return (
    <>
      {!disabled && !customErrorPlace && (
        <FieldErrorMessage errorMessage={errorMessage} errorMessageProps={errorMessageProps} />
      )}
      {helptextFooter && (
        <FieldHelptext helptext={helptextFooter} descriptionProps={descriptionProps} />
      )}
    </>
  )
}

export default FieldFooter
