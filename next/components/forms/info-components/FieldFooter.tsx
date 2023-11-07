import { DOMAttributes } from 'react'
import { HelptextPosition } from 'schema-generator/generator/uiOptionsTypes'

import FieldErrorMessage, { FieldErrorMessageProps } from './FieldErrorMessage'
import FieldHelptext from './FieldHelptext'

export type FieldFooterProps = FieldErrorMessageProps & {
  helptext?: string
  helptextPosition?: HelptextPosition
  disabled?: boolean
  customErrorPlace?: boolean
  descriptionProps?: DOMAttributes<never>
}

const FieldFooter = ({
  helptext,
  helptextPosition,
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
      {helptextPosition === 'footer' && (
        <FieldHelptext helptext={helptext} descriptionProps={descriptionProps} />
      )}
    </>
  )
}

export default FieldFooter
