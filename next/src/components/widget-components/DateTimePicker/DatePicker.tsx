import { Button } from '@bratislava/component-library'
import { parseDate } from '@internationalized/date'
import { useObjectRef } from '@react-aria/utils'
import { useControlledState } from '@react-stately/utils'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useMemo } from 'react'
import { useDatePicker } from 'react-aria'
import { Dialog, Popover } from 'react-aria-components'
import { useDatePickerState } from 'react-stately'

import { CalendarIcon } from '@/src/assets/ui-icons'
import { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'

import Calendar from './Calendar/Calendar'
import DateField from './DateField'

export type DatePickerProps = FieldWrapperProps & {
  value?: string | null
  minValue?: string
  maxValue?: string
  onChange?: (value: string | null | undefined) => void
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, minValue, maxValue, onChange = () => {}, ...rest }, forwardedRef) => {
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
      value: parsedValue,
      onChange: (date) => setValueControlled(date ? date.toString() : null),
      ...rest,
      shouldCloseOnSelect: false,
    })
    const { fieldProps, buttonProps, calendarProps, dialogProps, errorMessageProps } =
      useDatePicker(
        {
          minValue: minValue ? parseDate(minValue) : undefined,
          maxValue: maxValue ? parseDate(maxValue) : undefined,
          isDisabled: rest.isDisabled,
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
          ref={dateFieldRef}
          {...fieldProps}
          {...rest}
          errorMessage={rest.errorMessage}
          errorMessageProps={errorMessageProps}
          isOpen={state?.isOpen}
          popover={
            <>
              {state?.isOpen && (
                <Popover
                  isOpen={state.isOpen}
                  // TODO fix eslint error
                  // eslint-disable-next-line @typescript-eslint/unbound-method
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
        >
          <Button
            variant="icon-wrapped-negative-margin"
            {...buttonPropsFixed}
            isDisabled={rest.isDisabled}
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
