import { CalendarIcon } from '@assets/ui-icons'
import { parseDate } from '@internationalized/date'
import { useControlledState } from '@react-stately/utils'
import { useTranslation } from 'next-i18next'
import { forwardRef, RefObject, useMemo } from 'react'
import { OverlayProvider, useDatePicker } from 'react-aria'
import { useDatePickerState } from 'react-stately'

import ButtonNew from '../../simple-components/ButtonNew'
import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import Calendar from './Calendar/Calendar'
import DateField from './DateField'
import Popover from './Popover'

export type DatePickerProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'customErrorPlace'> & {
    value?: string | null
    minValue?: string
    maxValue?: string
    onChange?: (value: string | null | undefined) => void
  }

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      disabled,
      errorMessage,
      required,
      explicitOptional,
      tooltip,
      helptext,
      value,
      minValue,
      maxValue,
      onChange = () => {},
      customErrorPlace = false,
      ...rest
    },
    ref,
  ) => {
    const [valueControlled, setValueControlled] = useControlledState(value, null, onChange)
    const { t } = useTranslation('account', { keyPrefix: 'DatePicker' })

    const parsedValue = useMemo(() => {
      if (!valueControlled) {
        return null
      }
      try {
        return parseDate(valueControlled)
      } catch (error) {
        // Error: Invalid ISO 8601 date string
        return null
      }
    }, [valueControlled])

    const state = useDatePickerState({
      label,
      errorMessage,
      value: parsedValue,
      onChange: (date) => setValueControlled(date ? date.toString() : null),
      isRequired: required,
      isDisabled: disabled,
      ...rest,
      shouldCloseOnSelect: false,
    })
    const { fieldProps, buttonProps, calendarProps, dialogProps } = useDatePicker(
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
      setValueControlled(null)
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
            customErrorPlace={customErrorPlace}
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
      </div>
    )
  },
)

export default DatePicker
