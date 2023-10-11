import { CheckIcon } from '@assets/ui-icons'
import cx from 'classnames'
import Tooltip from 'components/forms/info-components/Tooltip/Tooltip'
import * as React from 'react'
import { useCheckboxGroupItem, useFocusRing, VisuallyHidden } from 'react-aria'

import { CheckboxGroupContext } from './CheckboxGroup'

type CheckBoxBase = {
  variant?: 'basic' | 'boxed'
  className?: string
  error?: boolean
  isIndeterminate?: boolean
  isSelected?: boolean
  isDisabled?: boolean
  children: React.ReactNode
  value: string
  tooltip?: string
}
const CheckboxGroupItem = ({
  error = false,
  isIndeterminate = false,
  tooltip,
  children,
  variant = 'basic',
  ...rest
}: CheckBoxBase) => {
  const state = React.useContext(CheckboxGroupContext)
  const ref = React.useRef(null)
  const { inputProps } = useCheckboxGroupItem({ ...rest, isIndeterminate, children }, state, ref)
  const { focusProps } = useFocusRing()
  const isDisabled = state.isDisabled || rest.isDisabled
  const isSelected = state.isSelected(rest.value)

  const checkboxStyle = cx(
    'flex h-6 w-6 items-center justify-center rounded border-2 border-solid border-gray-700',
    {
      'bg-gray-700': (isSelected || isIndeterminate) && !error,
      'group-hover:border-gray-600':
        (variant === 'basic' || variant === 'boxed') &&
        !isIndeterminate &&
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

  const containerStyle = cx('group flex flex-row', rest.className, {
    'rounded-lg border-2 border-solid bg-white px-4 py-3': variant === 'boxed',
    'border-gray-300 group-hover:border-gray-500':
      variant === 'boxed' && !isSelected && isIndeterminate && !isDisabled && !error,
    'border-gray-700 group-hover:border-gray-500':
      variant === 'boxed' && isSelected && !isIndeterminate && !isDisabled && !error,
    'cursor-pointer': !isDisabled,

    // error
    'border-negative-700': variant === 'boxed' && error,
    // disabled
    'cursor-not-allowed opacity-50': isDisabled,
  })

  const labelStyle = cx('text-16 flex text-gray-700', {})

  return (
    <div>
      {/* The input is inside of label, therefore it doesn't need an id. */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className={containerStyle}>
        <VisuallyHidden>
          <input {...inputProps} {...focusProps} ref={ref} />
        </VisuallyHidden>
        <div className="flex w-full items-center gap-3">
          <div>
            <div className={checkboxStyle}>
              {isSelected && !isIndeterminate && (
                <CheckIcon
                  className={cx('h-5 w-5 text-gray-0', {
                    hidden: !isSelected,
                  })}
                />
              )}
              {isIndeterminate && (
                <svg
                  className={cx('', {
                    hidden: !isIndeterminate,
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
          </div>
          <div className="flex w-full items-center justify-between gap-3">
            <div className={labelStyle}>{children}</div>
            {tooltip && <Tooltip text={tooltip} />}
          </div>
        </div>
      </label>
    </div>
  )
}

export default CheckboxGroupItem
