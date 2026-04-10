import { ReactNode } from 'react'
import {
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  RadioGroupProps as RACRadioGroupProps,
  RadioProps as RACRadioProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldErrorMessage from './_shared/FieldErrorMessage'
import FieldHeader from './_shared/FieldHeader'
import { FieldBaseProps } from './_shared/types'

export interface RadioGroupProps
  extends Omit<RACRadioGroupProps, 'orientation'>,
    FieldBaseProps {
  orientation?: 'vertical' | 'horizontal'
  children: ReactNode
}

export const RadioGroup = ({
  label,
  displayOptionalLabel,
  labelSize,
  helptext,
  helptextFooter,
  errorMessage,
  orientation = 'vertical',
  children,
  ...rest
}: RadioGroupProps) => {
  return (
    <RACRadioGroup
      {...rest}
      orientation={orientation}
      isInvalid={!!errorMessage}
      validationBehavior="aria"
    >
      <FieldHeader
        label={label}
        isRequired={rest.isRequired}
        displayOptionalLabel={displayOptionalLabel}
        labelSize={labelSize}
        helptext={helptext}
      />
      <div
        className={cn('flex', {
          'flex-col gap-4': orientation === 'vertical',
          'flex-row gap-6': orientation === 'horizontal',
        })}
      >
        {children}
      </div>
      {helptextFooter && (
        <div className="text-p2 text-content-passive-secondary mt-1">
          {helptextFooter}
        </div>
      )}
      <FieldErrorMessage errorMessage={errorMessage} />
    </RACRadioGroup>
  )
}

export interface RadioProps extends RACRadioProps {
  variant?: 'basic' | 'boxed' | 'card'
  description?: string
}

export const Radio = ({
  variant = 'basic',
  description,
  children,
  className,
  ...rest
}: RadioProps) => {
  return (
    <RACRadio
      {...rest}
      className={({ isSelected, isDisabled, isInvalid }) =>
        cn(
          'group flex w-full cursor-pointer gap-3 rounded-lg text-p2',
          {
            // basic variant
            'flex-row items-center': variant === 'basic' || variant === 'boxed',

            // boxed variant
            'border border-solid bg-background-passive-base p-3 lg:px-3 lg:py-2':
              variant === 'boxed',

            // card variant
            'flex-col items-start border border-solid bg-background-passive-base p-4':
              variant === 'card',

            // border colors (boxed + card)
            'border-border-active-default':
              (variant === 'boxed' || variant === 'card') &&
              !isSelected &&
              !isInvalid,
            'border-border-active-primary-default':
              (variant === 'boxed' || variant === 'card') && isSelected && !isInvalid,
            'border-border-error':
              (variant === 'boxed' || variant === 'card') && isInvalid,

            // hover
            'hover:border-border-active-hover':
              (variant === 'boxed' || variant === 'card') &&
              !isSelected &&
              !isDisabled &&
              !isInvalid,
            'hover:border-border-active-primary-hover':
              (variant === 'boxed' || variant === 'card') &&
              isSelected &&
              !isDisabled &&
              !isInvalid,

            // disabled
            'opacity-50 cursor-default': isDisabled,
            'border-border-active-disabled bg-background-passive-tertiary':
              isDisabled && (variant === 'boxed' || variant === 'card'),
          },
          className,
        )
      }
    >
      {({ isSelected, isDisabled, isInvalid, isFocusVisible }) => (
        <>
          <div
            className={cn(
              'grid size-6 min-h-6 min-w-6 place-content-center self-start rounded-full border-2',
              {
                'border-border-active-primary-default': !isInvalid,
                'border-border-error': isInvalid,
                'opacity-50': isDisabled,
                'ring-2 ring-offset-2': isFocusVisible,
              },
            )}
          >
            {isSelected && (
              <div
                className={cn('size-4 min-h-4 min-w-4 rounded-full', {
                  'bg-background-active-primary-default': !isInvalid,
                  'bg-background-error-default': isInvalid,
                })}
              />
            )}
          </div>
          <span className="flex grow flex-col gap-1">
            <span className={cn({ 'font-semibold': description })}>
              {children}
            </span>
            {description && <span>{description}</span>}
          </span>
        </>
      )}
    </RACRadio>
  )
}
