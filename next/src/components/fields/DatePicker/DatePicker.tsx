import { useTranslation } from 'next-i18next/pages'
import { forwardRef, Ref } from 'react'
import {
  Button as RACButton,
  DateInput as RACDateInput,
  DatePicker as RACDatePicker,
  DatePickerProps as RACDatePickerProps,
  DateSegment as RACDateSegment,
  DateValue,
  Dialog as RACDialog,
  Group as RACGroup,
  Popover as RACPopover,
} from 'react-aria-components'

import { CalendarIcon } from '@/src/assets/ui-icons'
import cn from '@/src/utils/cn'

import FieldWrapper from '../_shared/FieldWrapper'
import { FieldBaseProps } from '../_shared/types'
import Calendar from './Calendar'

export interface DatePickerProps extends RACDatePickerProps<DateValue>, FieldBaseProps {}

const DatePicker = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    ...rest
  }: DatePickerProps,
  ref: Ref<HTMLDivElement>,
) => {
  const { t } = useTranslation('account')

  return (
    <RACDatePicker
      {...rest}
      ref={ref}
      isInvalid={!!errorMessage}
      validationBehavior="aria"
      className={cn('flex w-full flex-col gap-2', rest.className)}
    >
      <FieldWrapper
        label={label}
        isRequired={rest.isRequired}
        displayOptionalLabel={displayOptionalLabel}
        labelSize={labelSize}
        helptext={helptext}
        helptextFooter={helptextFooter}
        errorMessage={errorMessage}
      >
        <RACGroup
          data-cy={rest.name ? `datepicker-${rest.name}` : undefined}
          className={({ isFocusWithin, isDisabled, isInvalid }) =>
            cn(
              'flex w-full items-center rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary outline-hidden',
              'px-3 py-2 lg:px-4 lg:py-3',
              {
                'border-border-active-default': !isInvalid && !isFocusWithin,
                'border-border-active-focused': !isInvalid && isFocusWithin,
                'border-border-error': isInvalid,
                'border-border-active-disabled bg-background-passive-tertiary': isDisabled,
                'hover:border-border-active-hover': !isDisabled && !isInvalid && !isFocusWithin,
              },
            )
          }
        >
          <RACDateInput className="flex flex-1">
            {(segment) => (
              <RACDateSegment
                segment={segment}
                className="data-[focused]:bg-background-active-primary-default data-[focused]:text-content-active-primary-inverted-default rounded-sm px-0.5 caret-transparent outline-hidden data-placeholder:text-content-passive-tertiary"
              />
            )}
          </RACDateInput>
          <RACButton
            type="button"
            aria-label={t('DatePicker.aria.openCalendar')}
            className="ml-2 flex size-6 items-center justify-center outline-hidden disabled:opacity-40"
          >
            <CalendarIcon />
          </RACButton>
        </RACGroup>
      </FieldWrapper>
      <RACPopover placement="bottom start" className="z-50">
        <RACDialog className="outline-hidden">
          <Calendar />
        </RACDialog>
      </RACPopover>
    </RACDatePicker>
  )
}

export default forwardRef(DatePicker)
