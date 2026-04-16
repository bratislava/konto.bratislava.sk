import { ReactNode } from 'react'
import { Radio as RACRadio, RadioProps as RACRadioProps } from 'react-aria-components'

import cn from '@/src/utils/cn'

export interface RadioProps extends Omit<RACRadioProps, 'children'> {
  variant?: 'basic' | 'boxed' | 'card'
  description?: string
  children: ReactNode
  /**
   * Whether any of the other radios in the group has a description. If they do, we want to display the label in semi-bold.
   */
  hasDescriptionInRadioGroup?: boolean
}

const Radio = ({
  variant = 'basic',
  description,
  children,
  hasDescriptionInRadioGroup,
  className,
  ...rest
}: RadioProps) => (
  <RACRadio
    {...rest}
    className={({ isSelected, isDisabled, isInvalid }) =>
      cn(
        'group flex w-full cursor-pointer gap-3 rounded-lg text-p2',
        {
          'items-center': variant === 'basic',
          'flex-col items-start': variant === 'card',
          'border bg-background-passive-base': variant !== 'basic',
          'px-3 py-2 lg:px-4 lg:py-3': variant === 'boxed',
          'p-4': variant === 'card', // There is no respo variant in Figma
          'border-border-active-default': variant !== 'basic' && !isInvalid && !isSelected,
          'border-border-active-primary-default': variant !== 'basic' && !isInvalid && isSelected,
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
          className={cn(
            'grid size-6 shrink-0 place-content-center rounded-full border-2',
            'border-border-active-primary-default',
            {
              'border-border-error': isInvalid && !isDisabled,
              'opacity-50': isDisabled,
              'ring-2 ring-offset-2': isFocusVisible,
            },
          )}
        >
          {isSelected ? (
            <div
              className={cn('size-4 rounded-full', 'bg-background-active-primary-default', {
                'bg-background-error-default': isInvalid && !isDisabled,
              })}
            />
          ) : null}
        </div>
        <span className="flex grow flex-col gap-1">
          <span className={cn({ 'font-semibold': !!description || hasDescriptionInRadioGroup })}>
            {children}
          </span>
          {description ? <span>{description}</span> : null}
        </span>
      </>
    )}
  </RACRadio>
)

export default Radio
