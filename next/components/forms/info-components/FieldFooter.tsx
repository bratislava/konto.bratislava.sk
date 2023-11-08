import { DOMAttributes } from 'react'

import FieldErrorMessage, { FieldErrorMessageProps } from './FieldErrorMessage'
import FieldHelptext from './FieldHelptext'

export type FieldFooterProps = FieldErrorMessageProps & {
  helptext?: string
  disabled?: boolean
  customErrorPlace?: boolean
  descriptionProps?: DOMAttributes<never>
}

const FieldFooter = ({
  helptext,
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
      {helptext && <FieldHelptext helptext={helptext} descriptionProps={descriptionProps} />}
    </>
  )
}

export default FieldFooter
