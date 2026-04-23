import { forwardRef, Ref } from 'react'
import {
  DateField as RACDateField,
  DateFieldProps as RACDateFieldProps,
  DateInput as RACDateInput,
  DateSegment as RACDateSegment,
  DateValue,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import { dateOrTimeContainerClassName, dateSegmentClassName } from './_shared/date-time-helpers'
import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface DateFieldProps extends RACDateFieldProps<DateValue>, FieldBaseProps {}

const DateField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    ...rest
  }: DateFieldProps,
  ref: Ref<HTMLDivElement>,
) => (
  <RACDateField
    {...rest}
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
      <RACDateInput
        ref={ref}
        data-cy={rest.name ? `datefield-${rest.name}` : undefined}
        className={dateOrTimeContainerClassName}
      >
        {(segment) => (
          <RACDateSegment
            segment={segment}
            data-cy={`date-time-${segment.type}`}
            className={dateSegmentClassName}
          />
        )}
      </RACDateInput>
    </FieldWrapper>
  </RACDateField>
)

export default forwardRef(DateField)
