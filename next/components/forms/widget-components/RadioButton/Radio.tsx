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
    'appearance-none outline-offset-4 bg-white m-0 w-6 h-6 min-w-[24px] min-h-[24px] grid place-content-center left-0 right-0 top-0 bottom-0 rounded-full border-2',
    {
      // "before" pseudo-element is used to display the selected radio button
      'before:w-4 before:h-4 before:min-w-[16px] before:min-h-[16px] before:bg-gray-700 before:rounded-full':
        isSelected,
      'border-gray-700': !isError,
      'border-negative-700 before:bg-negative-700': isError,

      // hover
      'group-hover:before:bg-gray-600 group-hover:border-gray-600': !isDisabled && !isError,

      // disabled
      'opacity-50': isDisabled,
      'cursor-pointer': !isDisabled,
    },
  )

  const containerStyle = cx('group w-full flex relative rounded-lg gap-3 text-16', className, {
    'flex-row items-center': variant === 'basic' || variant === 'boxed',
    'p-3 lg:py-3 lg:px-4': variant === 'boxed',
    'p-5 flex-col break-words items-start': variant === 'card',
    'border-2 border-solid bg-white rounded-8': variant === 'boxed' || variant === 'card',
    'border-gray-200': !isError && !isSelected,
    'border-negative-700': isError,

    'border-gray-700 hover:border-gray-500': isSelected && !isDisabled && !isError,
    'hover:border-gray-500': !isError && !isSelected && !isDisabled,

    'opacity-50': isDisabled,
    'cursor-pointer': !isDisabled,
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
