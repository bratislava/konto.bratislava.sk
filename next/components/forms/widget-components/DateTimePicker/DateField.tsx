import { createCalendar } from '@internationalized/date'
import { DateValue } from '@react-types/datepicker'
import cx from 'classnames'
import React, { ReactNode } from 'react'
import { AriaDatePickerProps, useDateField, useLocale } from 'react-aria'
import { useDateFieldState } from 'react-stately'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'
import DateTimeSegment from './DateTimeSegment'

type DateFieldProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'customErrorPlace'> & {
    children?: ReactNode
    isOpen?: boolean
  } & AriaDatePickerProps<DateValue>

const DateField = ({
  errorMessage = [],
  disabled,
  children,
  label,
  tooltip,
  helptext,
  isOpen,
  required,
  explicitOptional,
  customErrorPlace,
  ...rest
}: DateFieldProps) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const { locale } = useLocale()
  const state = useDateFieldState({
    label,
    description: helptext,
    errorMessage,
    isDisabled: disabled,
    isRequired: required,
    locale,
    createCalendar,
    ...rest,
  })

  const { fieldProps, labelProps, descriptionProps, errorMessageProps } = useDateField(
    { errorMessage, isDisabled: disabled, label, ...rest },
    state,
    ref,
  )
  const dateFieldStyle = cx('flex rounded-lg border-2 px-3 py-2 lg:px-4 lg:py-3', {
    'bg-white': !disabled,
    'border-gray-200 hover:border-gray-400': !disabled && !isOpen,
    'border-negative-700 hover:border-negative-700': errorMessage?.length > 0 && !disabled,
    'pointer-events-none border-gray-300 bg-gray-100': disabled,
    'border-gray-700': isOpen && !disabled && !(errorMessage?.length > 0),
  })
  return (
    <FieldWrapper
      label={label}
      htmlFor={fieldProps?.id}
      labelProps={labelProps}
      tooltip={tooltip}
      helptext={helptext}
      descriptionProps={descriptionProps}
      required={required}
      explicitOptional={explicitOptional}
      disabled={disabled}
      customErrorPlace={customErrorPlace}
      errorMessage={errorMessage}
      errorMessageProps={errorMessageProps}
    >
      <div {...fieldProps} ref={ref} className={dateFieldStyle}>
        {state?.segments?.map((segment, index) => (
          <DateTimeSegment key={index} segment={segment} state={state} />
        ))}
        <div className="ml-auto flex items-center">{children}</div>
      </div>
    </FieldWrapper>
  )
}

export default DateField
