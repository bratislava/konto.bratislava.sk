import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useRef } from 'react'
import { TimeValue, useTimeField } from 'react-aria'
import { useTimeFieldState } from 'react-stately'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'
import DateTimeSegment from './DateTimeSegment'

type TimeFieldProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'customErrorPlace'> & {
    children?: ReactNode
    onChange?: (value: TimeValue | null) => void
    onBlur?: () => void
    value?: TimeValue | null
    readOnly?: boolean
    minValue?: TimeValue
    maxValue?: TimeValue
  }

const TimeField = (props: TimeFieldProps) => {
  const {
    label,
    helptext,
    tooltip,
    required,
    explicitOptional,
    children,
    disabled,
    errorMessage = [],
    onChange,
    value,
    // setIsInputEdited,
    readOnly,
    customErrorPlace,
    ...rest
  } = props

  const ref = useRef<HTMLInputElement>(null)

  const { i18n } = useTranslation('account', { keyPrefix: 'TimePicker' })

  const propsReactAria = {
    label,
    description: helptext,
    isRequired: required,
    isDisabled: disabled,
    isReadOnly: readOnly,
    value,
    onChange,
    errorMessage,
    ...rest,
  }

  const state = useTimeFieldState({ ...propsReactAria, locale: i18n.language })

  const { labelProps, fieldProps, errorMessageProps, descriptionProps } = useTimeField(
    propsReactAria,
    state,
    ref,
  )

  const timeFieldStyle = cx('flex rounded-lg border-2 bg-white px-3 py-2 lg:px-4 lg:py-3', {
    'border-gray-200 focus-within:border-gray-700 hover:border-gray-400': !disabled,
    'border-negative-700 hover:border-negative-700': errorMessage?.length > 0 && !disabled,
    'pointer-events-none border-gray-300 bg-gray-100 text-gray-400': disabled,
    // 'focus-visible:border-gray-700': !disabled && !(errorMessage?.length > 0),
  })

  return (
    <FieldWrapper
      label={label}
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
      <div {...fieldProps} ref={ref} className={timeFieldStyle}>
        {state.segments.map((segment, index) => (
          <DateTimeSegment key={index} segment={segment} state={state} />
        ))}
      </div>
      {/* TODO button need proper arrangement and functionality */}
      {/* <ButtonNew */}
      {/*  variant="icon-wrapped-negative-margin" */}
      {/*  icon={<ClockIcon />} */}
      {/*  aria-label={t('aria.openClock') ?? 'Open clock'} */}
      {/*  excludeFromTabOrder */}
      {/*  className="cursor-default pointer-events-none" */}
      {/* /> */}
    </FieldWrapper>
  )
}

export default TimeField
