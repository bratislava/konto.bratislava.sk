import { AriaRadioProps } from '@react-types/radio'
import * as React from 'react'
import { useContext, useRef } from 'react'
import { useRadio } from 'react-aria'

import cn from '../../../../frontend/cn'
import BATooltip from '../../info-components/Tooltip/BATooltip'
import { RadioContext } from './RadioGroup'

type RadioProps = {
  variant?: 'basic' | 'boxed' | 'card'
  className?: string
  tooltip?: string
  description?: string
  /**
   * Whether any of other radios in the group has a description. If they do, we want to display the label in semi-bold.
   */
  radioGroupHasDescription?: boolean
} & AriaRadioProps

const Radio = ({
  variant = 'basic',
  className,
  tooltip,
  description,
  radioGroupHasDescription,
  ...rest
}: RadioProps) => {
  const state = useContext(RadioContext)
  const ref = useRef<HTMLInputElement>(null)
  const { inputProps, isDisabled, isSelected } = useRadio({ ...rest }, state, ref)

  const isError = state?.validationState === 'invalid'

  const inputStyle = cn(
    'top-0 right-0 bottom-0 left-0 m-0 grid h-6 min-h-[24px] w-6 min-w-[24px] appearance-none place-content-center self-start rounded-full border-2 bg-white outline-offset-4',
    {
      // "before" pseudo-element is used to display the selected radio button
      'before:h-4 before:min-h-[16px] before:w-4 before:min-w-[16px] before:rounded-full before:bg-gray-700':
        isSelected,
      'border-gray-700': !isError,
      'border-negative-700 before:bg-negative-700': isError,

      // hover
      'group-hover:border-gray-600 group-hover:before:bg-gray-600': !isDisabled && !isError,

      // disabled
      'opacity-50': isDisabled,
      'cursor-pointer': !isDisabled,
    },
  )

  const containerStyle = cn('group relative flex w-full gap-3 rounded-lg text-16', className, {
    'bg-white': !isDisabled && (variant === 'card' || variant === 'boxed'),
    'flex-row items-center': variant === 'basic' || variant === 'boxed',
    'p-3 lg:px-4 lg:py-3': variant === 'boxed',
    'flex-col items-start p-5 break-words': variant === 'card',
    'rounded-8 border-2 border-solid': variant === 'boxed' || variant === 'card',
    'border-gray-200': !isError && !isSelected,
    'border-negative-700': isError,

    'border-gray-700 hover:border-gray-500': isSelected && !isDisabled && !isError,
    'hover:border-gray-500': !isError && !isSelected && !isDisabled,

    'opacity-50': isDisabled,
    'cursor-pointer': !isDisabled,
    'border-gray-300 bg-gray-100': isDisabled && (variant === 'boxed' || variant === 'card'),
  })

  return (
    <div className="w-full">
      {/* The input is inside of label, therefore it doesn't need an id. */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className={containerStyle}>
        <input
          {...inputProps}
          ref={ref}
          className={inputStyle}
          data-cy={`radio-${rest.children?.toString().toLowerCase().replaceAll(' ', '-').replaceAll('.', '')}`}
        />
        <span className="flex grow flex-col gap-1">
          <span className={cn({ 'font-semibold': description || radioGroupHasDescription })}>
            {rest.children}
          </span>
          {description && <span>{description}</span>}
        </span>
        {/* TODO Tooltip should have bigger top padding in 'card' variant */}
        {tooltip && <BATooltip>{tooltip}</BATooltip>}
      </label>
    </div>
  )
}

export default Radio
