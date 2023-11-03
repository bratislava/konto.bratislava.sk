import cx from 'classnames'
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
  size = 'full',
  ...fieldHeaderProps
}: PropsWithChildren<FieldWrapperProps>) => {
  return (
    <div
      className={cx('flex w-full flex-col', {
        'max-w-[388px]': size === 'medium',
        'max-w-[200px]': size === 'small',
      })}
    >
      <FieldHeader {...fieldHeaderProps} />
      {children}
      <FieldFooter {...{ helptext, descriptionProps, disabled, errorMessage, customErrorPlace }} />
    </div>
  )
}

export default FieldWrapper
