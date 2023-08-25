import { DOMAttributes } from 'react'

import { FieldBaseProps } from '../widget-components/FieldBase'
import FieldErrorMessage, { FieldErrorMessageProps } from './FieldErrorMessage'

export type FieldFooterProps = Omit<FieldBaseProps, 'label'> &
  FieldErrorMessageProps & {
    disabled?: boolean
    customErrorPlace?: boolean
    descriptionProps?: DOMAttributes<never>
  }

const FieldFooter = ({
  helptext = '',
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
      {helptext && (
        <div className="w-full">
          <div
            {...descriptionProps}
            className="text-p3 sm:text-16 mb-1 whitespace-pre-wrap text-gray-700"
          >
            {helptext}
          </div>
        </div>
      )}
    </>
  )
}

export default FieldFooter
