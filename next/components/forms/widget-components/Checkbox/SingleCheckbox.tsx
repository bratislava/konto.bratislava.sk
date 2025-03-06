import { CheckIcon } from '@assets/ui-icons'
import React from 'react'
import { useCheckbox, useFocusRing, VisuallyHidden } from 'react-aria'
import { useToggleState } from 'react-stately'

import BATooltip from '../../info-components/Tooltip/BATooltip'
import cn from '../../../../frontend/cn'

type CheckBoxBase = {
  variant?: 'basic' | 'boxed'
  className?: string
  isDisabled?: boolean
  error?: boolean
  isIndeterminate?: boolean
  isSelected?: boolean
  children: React.ReactNode
  tooltip?: string
  onChange?: (isSelected: boolean) => void
  fullWidth?: boolean
  required?: boolean
}

const SingleCheckBox = ({
  error = false,
  children,
  tooltip,
  isDisabled = false,
  variant = 'basic',
  fullWidth,
  required,
  ...rest
}: CheckBoxBase) => {
  const state = useToggleState(rest)
  const ref = React.useRef<HTMLInputElement>(null)
  const { inputProps } = useCheckbox({ ...rest, isDisabled, children }, state, ref)

  const { focusProps } = useFocusRing()
  const isSelected = state.isSelected && !rest.isIndeterminate

  const checkboxStyle = cn(
    'flex h-6 w-6 min-w-[24px] items-center justify-center rounded-sm border-2 border-solid border-gray-700',
    {
      'bg-gray-700': (isSelected || rest.isIndeterminate) && !error,
      'group-hover:border-gray-600':
        (variant === 'basic' || variant === 'boxed') &&
        !rest.isIndeterminate &&
        !isSelected &&
        !isDisabled &&
        !error,
      'group-hover:border-gray-600 group-hover:bg-gray-600':
        (variant === 'basic' || variant === 'boxed') && isSelected && !isDisabled && !error,
      'cursor-not-allowed opacity-50': isDisabled,

      // error
      'border-negative-700': error && !isSelected && !isDisabled,
      'border-negative-700 bg-negative-700': error && isSelected && !isDisabled,
    },
  )

  const containerStyle = cn(
    'group flex flex-row items-start justify-center gap-3 p-0',
    rest.className,
    {
      'rounded-lg border-2 border-solid bg-white px-4 py-3': variant === 'boxed',
      'border-gray-300 group-hover:border-gray-500':
        variant === 'boxed' && !isSelected && rest.isIndeterminate && !isDisabled && !error,
      'border-gray-700 group-hover:border-gray-500':
        variant === 'boxed' && isSelected && !isDisabled && !error,

      // error
      'border-negative-700': variant === 'boxed' && error,
      // disabled
      'cursor-not-allowed opacity-50': isDisabled,
    },
  )

  const labelStyle = cn('flex gap-3 text-16 text-gray-700 select-none', {
    'w-full': fullWidth,
  })

  return (
    <div>
      {/* The input is inside of label, therefore it doesn't need an id. */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className={containerStyle}>
        <VisuallyHidden>
          <input {...inputProps} {...focusProps} ref={ref} />
        </VisuallyHidden>
        <div className={checkboxStyle}>
          {isSelected && (
            <CheckIcon
              className={cn('h-5 w-5 text-gray-0', {
                hidden: !isSelected,
              })}
            />
          )}
          {rest.isIndeterminate && (
            <svg
              className={cn({
                hidden: !rest.isIndeterminate,
              })}
              width="12"
              height="2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.8333 1.83333H0.166656V0.166668H11.8333V1.83333Z" fill="white" />
            </svg>
          )}
        </div>
        <div className={labelStyle}>
          <div
            className={cn('relative', {
              'after:absolute after:bottom-0.5 after:ml-0.5 after:text-16-semibold after:text-main-700 after:content-["*"]':
                required,
            })}
          >
            {children}
          </div>
          {tooltip && <BATooltip>{tooltip}</BATooltip>}
        </div>
      </label>
    </div>
  )
}

export default SingleCheckBox
