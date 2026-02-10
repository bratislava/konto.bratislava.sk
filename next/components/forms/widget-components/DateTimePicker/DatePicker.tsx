import { CalendarIcon } from '@assets/ui-icons'
import { parseDate } from '@internationalized/date'
import { useObjectRef } from '@react-aria/utils'
import { useControlledState } from '@react-stately/utils'
import { useTranslation } from 'next-i18next'
import { forwardRef, useMemo } from 'react'
import { useDatePicker } from 'react-aria'
import { Dialog, Popover } from 'react-aria-components'
import { useDatePickerState } from 'react-stately'

import Button from '../../simple-components/Button'
import { FieldWrapperProps } from '../FieldWrapper'
import Calendar from './Calendar/Calendar'
import DateField from './DateField'

export type DatePickerProps = FieldWrapperProps & {
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
      tooltip,
      helptext,
      helptextMarkdown,
      helptextFooter,
      helptextFooterMarkdown,
      value,
      minValue,
      maxValue,
      onChange = () => {},
      customErrorPlace = false,
      size,
      labelSize,
      displayOptionalLabel,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef)
    const dateFieldRef = useObjectRef<HTMLDivElement>(null)
    const [valueControlled, setValueControlled] = useControlledState(value, null, onChange)
    const { t } = useTranslation('account')

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
      ref,
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
      <div className="relative" ref={ref}>
        <DateField
          {...fieldProps}
          label={label}
          helptext={helptext}
          helptextMarkdown={helptextMarkdown}
          helptextFooter={helptextFooter}
          helptextFooterMarkdown={helptextFooterMarkdown}
          required={required}
          disabled={disabled}
          tooltip={tooltip}
          errorMessage={errorMessage}
          isOpen={state?.isOpen}
          customErrorPlace={customErrorPlace}
          popover={
            <>
              {state?.isOpen && (
                <Popover
                  isOpen={state.isOpen}
                  onOpenChange={state.setOpen}
                  triggerRef={dateFieldRef}
                  placement="bottom start"
                  shouldCloseOnInteractOutside={() => true}
                >
                  <Dialog {...dialogProps}>
                    <Calendar {...calendarProps} onConfirm={handleConfirm} onReset={handleReset} />
                  </Dialog>
                </Popover>
              )}
            </>
          }
          size={size}
          labelSize={labelSize}
          displayOptionalLabel={displayOptionalLabel}
          ref={dateFieldRef}
        >
          <Button
            variant="icon-wrapped-negative-margin"
            {...buttonPropsFixed}
            isDisabled={disabled}
            icon={<CalendarIcon />}
            // TODO investigate why t can return undefined
            aria-label={t('DatePicker.aria.openCalendar') ?? 'Open calendar'}
          />
        </DateField>
      </div>
    )
  },
)

export default DatePicker
