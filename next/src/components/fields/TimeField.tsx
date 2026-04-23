import { forwardRef, Ref } from 'react'
import {
  DateInput as RACDateInput,
  DateSegment as RACDateSegment,
  TimeField as RACTimeField,
  TimeFieldProps as RACTimeFieldProps,
  TimeValue,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

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
        className={({ isFocusWithin, isDisabled, isInvalid }) =>
          cn(
            'flex w-full rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary outline-hidden',
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
        {(segment) => (
          <RACDateSegment
            segment={segment}
            className={cn(
              'rounded-sm px-0.5 type-literal:p-0',
              'whitespace-nowrap caret-transparent outline-hidden',
              'placeholder:text-content-passive-tertiary focus:bg-background-passive-secondary',
            )}
          />
        )}
      </RACDateInput>
    </FieldWrapper>
  </RACTimeField>
)

export default forwardRef(TimeField)
