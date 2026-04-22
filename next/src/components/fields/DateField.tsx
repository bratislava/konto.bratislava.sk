import { forwardRef, Ref } from 'react'
import {
  DateField as RACDateField,
  DateFieldProps as RACDateFieldProps,
  DateInput as RACDateInput,
  DateSegment as RACDateSegment,
  DateValue,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

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
            className="rounded-sm px-0.5 caret-transparent outline-hidden data-[focused]:bg-background-passive-secondary data-placeholder:text-content-passive-tertiary"
          />
        )}
      </RACDateInput>
    </FieldWrapper>
  </RACDateField>
)

export default forwardRef(DateField)
