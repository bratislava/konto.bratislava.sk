import { ReactNode } from 'react'
import {
  RadioGroup as RACRadioGroup,
  RadioGroupProps as RACRadioGroupProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'orientation'>, FieldBaseProps {
  orientation?: 'vertical' | 'horizontal'
  children: ReactNode
}

const RadioGroup = ({
  label,
  displayOptionalLabel,
  labelSize,
  helptext,
  helptextFooter,
  errorMessage,
  orientation = 'vertical',
  children,
  ...rest
}: RadioGroupProps) => (
  <RACRadioGroup
    {...rest}
    orientation={orientation}
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
        className={cn('flex', {
          'flex-col gap-3': orientation === 'vertical',
          'flex-row gap-6': orientation === 'horizontal',
        })}
      >
        {children}
      </div>
    </FieldWrapper>
  </RACRadioGroup>
)

export default RadioGroup
