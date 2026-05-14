import { forwardRef, Ref } from 'react'
import {
  DateInput as RACDateInput,
  DateSegment as RACDateSegment,
} from 'react-aria-components/DateField'
import {
  TimeField as RACTimeField,
  TimeFieldProps as RACTimeFieldProps,
  TimeValue,
} from 'react-aria-components/TimeField'

import cn from '@/src/utils/cn'

import { dateOrTimeContainerClassName, timeSegmentClassName } from './_shared/dateTimeHelpers'
import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface TimeFieldProps extends RACTimeFieldProps<TimeValue>, FieldBaseProps {}

const TimeField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    granularity = 'minute',
    ...rest
  }: TimeFieldProps,
  ref: Ref<HTMLDivElement>,
) => (
  <RACTimeField
    {...rest}
    granularity={granularity}
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
        data-cy={rest.name ? `timefield-${rest.name}` : undefined}
        className={dateOrTimeContainerClassName}
      >
        {(segment) => (
          <RACDateSegment
            segment={segment}
            data-cy={`date-time-${segment.type}`}
            className={timeSegmentClassName}
          />
        )}
      </RACDateInput>
    </FieldWrapper>
  </RACTimeField>
)

export default forwardRef(TimeField)
