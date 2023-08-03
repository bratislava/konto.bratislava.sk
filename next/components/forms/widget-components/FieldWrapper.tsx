import React, { PropsWithChildren } from 'react'

import FieldErrorMessage, { FieldErrorMessageProps } from '../info-components/FieldErrorMessage'
import FieldHeader, { FieldHeaderProps } from '../info-components/FieldHeader'

type FieldWrapperProps = FieldHeaderProps &
  FieldErrorMessageProps & {
    disabled?: boolean
    customErrorPlace?: boolean
  }

const FieldWrapper = ({
  children,
  errorMessage,
  errorMessageProps,
  disabled,
  customErrorPlace,
  ...fieldHeaderProps
}: PropsWithChildren<FieldWrapperProps>) => {
  return (
    <>
      <FieldHeader {...fieldHeaderProps} />
      {children}
      {!disabled && !customErrorPlace && (
        <FieldErrorMessage errorMessage={errorMessage} errorMessageProps={errorMessageProps} />
      )}
    </>
  )
}

export default FieldWrapper
