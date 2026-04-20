import { ReactNode } from 'react'
import {
  CheckboxGroup as RACCheckboxGroup,
  CheckboxGroupProps as RACCheckboxGroupProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface CheckboxGroupProps extends RACCheckboxGroupProps, FieldBaseProps {
  children: ReactNode
}

const CheckboxGroup = ({
  label,
  displayOptionalLabel,
  labelSize,
  helptext,
  helptextFooter,
  errorMessage,
  children,
  ...rest
}: CheckboxGroupProps) => (
  <RACCheckboxGroup
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
      <div className="flex flex-col gap-3">{children}</div>
    </FieldWrapper>
  </RACCheckboxGroup>
)

export default CheckboxGroup
