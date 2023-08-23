import { CheckIcon, CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import * as React from 'react'
import { useId } from 'react'
import { useFocusRing, useSwitch, VisuallyHidden } from 'react-aria'
import { ToggleState, useToggleState } from 'react-stately'

type ToggleBase = {
  className?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  defaultSelected?: boolean
  isSelected?: boolean
  children?: React.ReactNode
  value?: string
  id?: string
  onChange?: (isSelected: boolean) => void
}

const Toggle = ({ children, isDisabled = false, isSelected = true, ...rest }: ToggleBase) => {
  const state: ToggleState = useToggleState({ ...rest, isDisabled, isSelected })
  const generatedId = useId()
  const generatedOrProvidedId = rest.id ?? generatedId
  const ref = React.useRef(null)
  const { inputProps } = useSwitch(
    { ...rest, isDisabled, children, 'aria-label': generatedOrProvidedId },
    state,
    ref,
  )
  const { focusProps } = useFocusRing()

  const toggleContainer = cx('group flex select-none flex-row items-center gap-4 p-0', {
    'cursor-not-allowed opacity-50': isDisabled,
    'cursor-pointer': !isDisabled,
  })
  const labelStyle = cx('text-16 select-none text-gray-700')

  const togglerContainer = cx('flex h-6 w-12 items-center rounded-full', {
    'bg-success-700': state.isSelected,
    'bg-gray-400': !state.isSelected,
  })

  const toggleBall = cx('relative h-5 w-5 rounded-full bg-white', {
    'left-[26px]': state.isSelected,
    'left-0.5': !state.isSelected,
  })
  return (
    <label htmlFor={generatedOrProvidedId} className={toggleContainer}>
      <VisuallyHidden>
        <input id={generatedOrProvidedId} {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <div className={togglerContainer}>
        <div
          className={cx('absolute ml-1.5 flex h-4 w-4 items-center justify-center', {
            hidden: !state.isSelected,
          })}
        >
          <CheckIcon className="text-gray-0" />
        </div>
        <div
          className={cx('absolute ml-[26px] flex h-4 w-4 items-center justify-center', {
            hidden: state.isSelected,
          })}
        >
          <CrossIcon className="text-gray-0" />
        </div>
        <div className={toggleBall} />
      </div>

      {children && <div className={labelStyle}>{children}</div>}
    </label>
  )
}

export default Toggle
