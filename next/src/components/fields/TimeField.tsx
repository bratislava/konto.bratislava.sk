import { forwardRef, Ref } from 'react'
import {
  DateInput as RACDateInput,
  DateSegment as RACDateSegment,
  TimeField as RACTimeField,
  TimeFieldProps as RACTimeFieldProps,
  TimeValue,
} from 'react-aria-components'

import { ClockIcon } from '@/src/assets/ui-icons'
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
      <div
        className={cn(
          'flex w-full items-center gap-4 rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary outline-hidden',
          'px-3 py-2 lg:px-4 lg:py-3',
          {
            'border-border-active-default focus-within:border-border-active-focused hover:border-border-active-hover':
              !errorMessage && !rest.isDisabled,
            'border-border-error': !!errorMessage,
            'border-border-active-disabled bg-background-passive-tertiary': rest.isDisabled,
          },
        )}
      >
        <RACDateInput
          ref={ref}
          data-cy={rest.name ? `timefield-${rest.name}` : undefined}
          className="flex flex-1"
        >
          {(segment) => (
            <RACDateSegment
              segment={segment}
              className="rounded-sm px-0.5 caret-transparent outline-hidden data-[focused]:bg-background-passive-secondary data-placeholder:text-content-passive-tertiary"
            />
          )}
        </RACDateInput>
        <ClockIcon className="size-6 shrink-0" />
      </div>
    </FieldWrapper>
  </RACTimeField>
)

export default forwardRef(TimeField)
