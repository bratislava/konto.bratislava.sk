import React, { PropsWithChildren } from 'react'

import { FieldErrorMessageProps } from '../info-components/FieldErrorMessage'
import FieldFooter, { FieldFooterProps } from '../info-components/FieldFooter'
import FieldHeader, { FieldHeaderProps } from '../info-components/FieldHeader'

type FieldWrapperProps = FieldHeaderProps &
  FieldFooterProps &
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
  helptext,
  descriptionProps,
  ...fieldHeaderProps
}: PropsWithChildren<FieldWrapperProps>) => {
  return (
    <>
      <FieldHeader {...fieldHeaderProps} />
      {children}
      <FieldFooter {...{ helptext, descriptionProps, disabled, errorMessage, customErrorPlace }} />
    </>
  )
}

export default FieldWrapper
