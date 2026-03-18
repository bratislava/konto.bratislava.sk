import { useTranslation } from 'next-i18next'
import React, { useRef } from 'react'
import { TimeValue, useTimeField } from 'react-aria'
import { useTimeFieldState } from 'react-stately'

import DateTimeSegment from '@/src/components/widget-components/DateTimePicker/DateTimeSegment'
import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

type TimeFieldProps = FieldWrapperProps & {
  onChange?: (value: TimeValue | null) => void
  onBlur?: () => void
  value?: TimeValue | null
  minValue?: TimeValue
  maxValue?: TimeValue
}

const TimeField = (props: TimeFieldProps) => {
  const { onChange, value, ...rest } = props

  const ref = useRef<HTMLInputElement>(null)

  const { i18n } = useTranslation('account')

  const propsReactAria = {
    description: rest.helptext,
    value,
    onChange,
    ...rest,
  }

  const state = useTimeFieldState({ ...propsReactAria, locale: i18n.language })

  const { labelProps, fieldProps, errorMessageProps, descriptionProps } = useTimeField(
    propsReactAria,
    state,
    ref,
  )

  const timeFieldStyle = cn('flex rounded-lg border bg-white px-3 py-2 lg:px-4 lg:py-3', {
    'border-gray-200 focus-within:border-gray-700 hover:border-gray-400': !rest.isDisabled,
    'border-negative-700 hover:border-negative-700': rest.errorMessage?.length && !rest.isDisabled,
    'pointer-events-none border-gray-300 bg-gray-100 text-gray-400': rest.isDisabled,
    // 'focus-visible:border-gray-700': !isDisabled && !(errorMessage?.length > 0),
  })

  return (
    <FieldWrapper
      {...rest}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
    >
      <div {...fieldProps} ref={ref} className={timeFieldStyle}>
        {state.segments.map((segment, index) => (
          <DateTimeSegment key={index} segment={segment} state={state} />
        ))}
      </div>
    </FieldWrapper>
  )
}

export default TimeField
