import { ReactNode } from 'react'
import { Radio as RACRadio, RadioProps as RACRadioProps } from 'react-aria-components'

import cn from '@/src/utils/cn'

export interface RadioProps extends Omit<RACRadioProps, 'children'> {
  variant?: 'basic' | 'boxed' | 'card'
  description?: string
  children: ReactNode
}

const Radio = ({ variant = 'basic', description, children, className, ...rest }: RadioProps) => (
  <RACRadio
    {...rest}
    className={({ isSelected, isDisabled, isInvalid }) =>
      cn(
        'group flex w-full cursor-pointer gap-3 rounded-lg text-p2',
        {
          'items-center': variant === 'basic' || variant === 'boxed',
          'flex-col items-start': variant === 'card',
          'border border-solid bg-background-passive-base': variant !== 'basic',
          'p-3 lg:px-3 lg:py-2': variant === 'boxed',
          'p-4': variant === 'card',
          'border-border-active-default': variant !== 'basic' && !isSelected && !isInvalid,
          'border-border-active-primary-default': variant !== 'basic' && isSelected && !isInvalid,
          'border-border-error': variant !== 'basic' && isInvalid,
          'hover:border-border-active-hover':
            variant !== 'basic' && !isSelected && !isDisabled && !isInvalid,
          'hover:border-border-active-primary-hover':
            variant !== 'basic' && isSelected && !isDisabled && !isInvalid,
          'cursor-default opacity-50': isDisabled,
          'border-border-active-disabled bg-background-passive-tertiary':
            isDisabled && variant !== 'basic',
        },
        className,
      )
    }
  >
    {({ isSelected, isDisabled, isInvalid, isFocusVisible }) => (
      <>
        <div
          className={cn('grid size-6 shrink-0 place-content-center rounded-full border-2', {
            'border-border-active-primary-default': !isInvalid,
            'border-border-error': isInvalid,
            'opacity-50': isDisabled,
            'ring-2 ring-offset-2': isFocusVisible,
          })}
        >
          {isSelected ? (
            <div
              className={cn('size-4 rounded-full', {
                'bg-background-active-primary-default': !isInvalid,
                'bg-background-error-default': isInvalid,
              })}
            />
          ) : null}
        </div>
        <span className="flex grow flex-col gap-1">
          <span className={cn({ 'font-semibold': !!description })}>{children}</span>
          {description ? <span>{description}</span> : null}
        </span>
      </>
    )}
  </RACRadio>
)

export default Radio
