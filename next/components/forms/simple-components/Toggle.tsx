import { CheckIcon, CrossIcon } from '@assets/ui-icons'
import cn from 'frontend/cn'
import * as React from 'react'
import { useId, useRef } from 'react'
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
  const ref = useRef<HTMLInputElement>(null)
  const { inputProps } = useSwitch(
    { ...rest, isDisabled, children, 'aria-label': generatedOrProvidedId },
    state,
    ref,
  )
  const { focusProps } = useFocusRing()

  const toggleContainer = cn('group flex select-none flex-row items-center gap-4 p-0', {
    'cursor-not-allowed opacity-50': isDisabled,
    'cursor-pointer': !isDisabled,
  })
  const labelStyle = cn('text-16 select-none text-gray-700')

  const togglerContainer = cn('flex h-6 w-12 items-center rounded-full', {
    'bg-success-700': state.isSelected,
    'bg-gray-400': !state.isSelected,
  })

  const toggleBall = cn('relative h-5 w-5 rounded-full bg-white', {
    'left-[26px]': state.isSelected,
    'left-0.5': !state.isSelected,
  })
  return (
    <label
      htmlFor={generatedOrProvidedId}
      className={toggleContainer}
      data-cy={`${rest.id?.replace(/_/g, '-')}-toggle`}
    >
      <VisuallyHidden>
        <input id={generatedOrProvidedId} {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <div className={togglerContainer}>
        <div
          className={cn('absolute ml-1.5 flex h-4 w-4 items-center justify-center', {
            hidden: !state.isSelected,
          })}
        >
          <CheckIcon className="text-gray-0" />
        </div>
        <div
          className={cn('absolute ml-[26px] flex h-4 w-4 items-center justify-center', {
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
