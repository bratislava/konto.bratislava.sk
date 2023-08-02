import { CalendarIcon } from '@assets/ui-icons'
import { DateValue, parseDate } from '@internationalized/date'
import FieldErrorMessage from 'components/forms/info-components/FieldErrorMessage'
import { useTranslation } from 'next-i18next'
import { forwardRef, RefObject, useState } from 'react'
import { OverlayProvider, useDatePicker } from 'react-aria'
import { useDatePickerState } from 'react-stately'

import ButtonNew from '../../simple-components/ButtonNew'
import { ExplicitOptionalType } from '../../types/ExplicitOptional'
import Calendar from './Calendar/Calendar'
import DateField from './DateField'
import Popover from './Popover'

export type DatePickerBase = {
  label?: string
  helptext?: string
  tooltip?: string
  required?: boolean
  explicitOptional?: ExplicitOptionalType
  disabled?: boolean
  // providing this 'prop' will disable error messages rendering inside this component
  customErrorPlace?: boolean
  errorMessage?: string[]
  value?: string
  minValue?: string
  maxValue?: string
  onChange?: (value?: DateValue) => void
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerBase>(
  (
    {
      label,
      disabled,
      errorMessage,
      required,
      explicitOptional,
      tooltip,
      helptext,
      value = '',
      minValue,
      maxValue,
      onChange,
      customErrorPlace = false,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation('account', { keyPrefix: 'DatePicker' })

    const [valueState, setValueState] = useState<DateValue | null>(null)

    const state = useDatePickerState({
      label,
      errorMessage,
      // TODO Why there is '|| null'?
      value: onChange && value ? parseDate(value) : valueState || null,
      onChange: onChange || setValueState,
      isRequired: required,
      isDisabled: disabled,
      ...rest,
      shouldCloseOnSelect: false,
    })
    const { fieldProps, buttonProps, calendarProps, dialogProps, errorMessageProps } =
      useDatePicker(
        {
          errorMessage,
          minValue: minValue ? parseDate(minValue) : undefined,
          maxValue: maxValue ? parseDate(maxValue) : undefined,
          isDisabled: disabled,
          label,
          ...rest,
        },
        state,
        ref as RefObject<HTMLDivElement>,
      )
    const buttonPropsFixed = {
      ...buttonProps,
      children: undefined,
      href: undefined,
      target: undefined,
    }

    const handleConfirm = () => {
      state?.close()
    }

    const handleReset = () => {
      // https://github.com/adobe/react-spectrum/discussions/3318
      // @ts-ignore
      state?.setDateValue(null)
      setValueState(null)
      state?.close()
    }

    return (
      <div className="relative w-full max-w-xs">
        <div ref={ref}>
          <DateField
            {...fieldProps}
            label={label}
            helptext={helptext}
            required={required}
            explicitOptional={explicitOptional}
            disabled={disabled}
            tooltip={tooltip}
            errorMessage={errorMessage}
            isOpen={state?.isOpen}
          >
            <ButtonNew
              variant="icon-wrapped-negative-margin"
              {...buttonPropsFixed}
              isDisabled={disabled}
              icon={<CalendarIcon />}
              // TODO investigate why t can return undefined
              aria-label={t('aria.openCalendar') ?? 'Open calendar'}
            />
          </DateField>
        </div>
        {state?.isOpen && (
          <OverlayProvider>
            <Popover {...dialogProps} isOpen={state?.isOpen} onClose={handleConfirm}>
              <Calendar {...calendarProps} onConfirm={handleConfirm} onReset={handleReset} />
            </Popover>
          </OverlayProvider>
        )}
        {!disabled && !customErrorPlace && (
          <FieldErrorMessage errorMessage={errorMessage} errorMessageProps={errorMessageProps} />
        )}
      </div>
    )
  },
)

export default DatePicker
