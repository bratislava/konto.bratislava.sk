import { AriaRadioProps } from '@react-types/radio'
import cx from 'classnames'
import Tooltip from 'components/forms/info-components/Tooltip/Tooltip'
import * as React from 'react'
import { useContext, useRef } from 'react'
import { useRadio } from 'react-aria'

import { RadioContext } from './RadioGroup'

type RadioProps = {
  variant?: 'basic' | 'boxed' | 'card'
  className?: string
  tooltip?: string
} & AriaRadioProps

const Radio = ({ variant = 'basic', className, tooltip, ...rest }: RadioProps) => {
  const state = useContext(RadioContext)
  const ref = useRef(null)
  const { inputProps, isDisabled, isSelected } = useRadio({ ...rest }, state, ref)

  const isError = state?.validationState === 'invalid'

  const inputStyle = cx(
    'bottom-0 left-0 right-0 top-0 m-0 grid h-6 min-h-[24px] w-6 min-w-[24px] appearance-none place-content-center rounded-full border-2 bg-white outline-offset-4',
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

  const containerStyle = cx('text-16 group relative flex w-full gap-3 rounded-lg', className, {
    'bg-white': !isDisabled && (variant === 'card' || variant === 'boxed'),
    'flex-row items-center': variant === 'basic' || variant === 'boxed',
    'p-3 lg:px-4 lg:py-3': variant === 'boxed',
    'flex-col items-start break-words p-5': variant === 'card',
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
        <input {...inputProps} ref={ref} className={inputStyle} />
        <span className="grow">{rest.children}</span>
        {/* TODO Tooltip should have bigger top padding in 'card' variant */}
        {tooltip && <Tooltip position="top-right" text={tooltip} className="shrink-0" />}
      </label>
    </div>
  )
}

export default Radio
