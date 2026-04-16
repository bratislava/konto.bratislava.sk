import { Checkbox as RACCheckbox, CheckboxProps as RACCheckboxProps } from 'react-aria-components'

import cn from '@/src/utils/cn'

export interface CheckboxProps extends RACCheckboxProps {
  variant?: 'basic' | 'boxed'
}

const Checkbox = ({ variant = 'basic', children, className, ...rest }: CheckboxProps) => (
  <RACCheckbox
    {...rest}
    className={({ isSelected, isDisabled, isInvalid, isIndeterminate }) =>
      cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-lg text-p2',
        {
          'border bg-background-passive-base px-3 py-2 lg:px-4 lg:py-3': variant === 'boxed',
          'border-border-active-default':
            variant === 'boxed' && !isInvalid && !isSelected && !isIndeterminate,
          'border-border-active-primary-default':
            variant === 'boxed' && !isInvalid && (isSelected || isIndeterminate),
          'border-border-error': variant === 'boxed' && isInvalid,
          'hover:border-border-active-hover':
            variant === 'boxed' && !isSelected && !isIndeterminate && !isDisabled && !isInvalid,
          'cursor-default opacity-50': isDisabled,
          'border-border-active-disabled bg-background-passive-tertiary':
            isDisabled && variant === 'boxed',
        },
        className,
      )
    }
  >
    {({ isSelected, isDisabled, isInvalid, isIndeterminate, isFocusVisible }) => (
      <>
        <div
          className={cn(
            'grid size-6 shrink-0 place-content-center rounded border-2',
            'border-border-active-primary-default',
            {
              'border-border-error': isInvalid && !isDisabled,
              'bg-background-active-primary-default': (isSelected || isIndeterminate) && !isInvalid,
              'bg-background-error-default': (isSelected || isIndeterminate) && isInvalid,
              'opacity-50': isDisabled,
              'ring-2 ring-offset-2': isFocusVisible,
            },
          )}
        >
          {isSelected ? (
            <svg
              viewBox="0 0 18 18"
              aria-hidden="true"
              className="size-4 fill-none stroke-white stroke-[3px]"
            >
              <polyline points="2 9 7 14 16 4" />
            </svg>
          ) : null}
          {isIndeterminate ? (
            <svg viewBox="0 0 18 18" aria-hidden="true" className="size-4 fill-white stroke-none">
              <rect x={1} y={7.5} width={16} height={3} />
            </svg>
          ) : null}
        </div>
        {children}
      </>
    )}
  </RACCheckbox>
)

export default Checkbox
