import SelectedIcon from '@assets/images/new-icons/ui/done.svg'
import cx from 'classnames'
import React, { useRef } from 'react'
import { useButton } from 'react-aria'

import { FormStepMetadata } from '../types/Steps'

interface StepperViewRowProps {
  step: FormStepMetadata
  isCurrent?: boolean
  onClick?: () => void
  className?: string
  isButton?: boolean
}

const StepperViewRow = ({ step, isCurrent, onClick, className, isButton }: StepperViewRowProps) => {
  const { title, isSummary, isSubmitted, displayIndex } = step
  const iconClassName = cx(
    'min-w-8 w-8 flex-row h-8 rounded-full flex justify-center items-center border-2 shrink-0',
    {
      'bg-gray-700 border-gray-700 text-white': isSubmitted || isCurrent,
      'border-gray-300 text-gray-300 bg-transparent': !isSubmitted && !isCurrent,
    },
  )

  const buttonRef = useRef<HTMLDivElement>(null)
  const { buttonProps } = useButton({ onPress: onClick, elementType: 'div' }, buttonRef)

  return (
    <div className={cx('flex flex-col select-none', className)}>
      <div
        className="flex flex-row gap-3 items-center cursor-pointer"
        {...(isButton ? buttonProps : {})}
        ref={buttonRef}
      >
        <div className={iconClassName}>
          {isCurrent || !isSubmitted ? (
            displayIndex
          ) : (
            <SelectedIcon fill="white" className="w-6 h-6" />
          )}
        </div>
        <p className="text-p3-medium w-72 ">{title}</p>
      </div>
      {!isSummary && isButton && (
        <div className="w-8 h-8 flex flex-row justify-center items-center">
          <div className="w-0.5 h-4 bg-gray-300 py-2" />
        </div>
      )}
    </div>
  )
}

export default StepperViewRow
