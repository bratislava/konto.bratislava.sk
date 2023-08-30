import cx from 'classnames'
import Link from 'next/link'
import React from 'react'

import { FormStepperStep } from '../types/Steps'
import { useFormState } from '../useFormState'
import StepperViewRow from './StepperViewRow'

type StepperViewListProps = {
  onSkipToStep: () => void
}
const StepperViewList = ({ onSkipToStep = () => {} }: StepperViewListProps) => {
  const { stepperData, currentStepperStep } = useFormState()

  return (
    <ol>
      {stepperData.map((step: FormStepperStep, index: number) => {
        const isLast = index === stepperData.length - 1
        const isCurrent = step === currentStepperStep

        return (
          <li
            className={cx({
              'relative after:my-2 after:ml-[15px] after:block after:h-4 after:w-0.5 after:bg-gray-300':
                !isLast,
            })}
            key={index}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <Link href={`#${step.hash}`} onClick={() => onSkipToStep()}>
              <StepperViewRow step={step} isCurrent={isCurrent} />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export default StepperViewList
