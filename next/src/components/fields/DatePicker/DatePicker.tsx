import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, Ref } from 'react'
import {
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

import { dateOrTimeContainerClassName, dateSegmentClassName } from '../_shared/date-time-helpers'
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
          className={dateOrTimeContainerClassName}
        >
          <RACDateInput className="flex flex-1">
            {(segment) => <RACDateSegment segment={segment} className={dateSegmentClassName} />}
          </RACDateInput>
          <Button
            variant="icon-wrapped-negative-margin"
            aria-label={t('DatePicker.aria.openCalendar')}
            icon={<CalendarIcon />}
          />
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
