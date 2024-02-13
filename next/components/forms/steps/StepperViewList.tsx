import cx from 'classnames'
import React from 'react'
import { Button as AriaButton } from 'react-aria-components'

import { FormStepIndex, FormStepperStep } from '../types/Steps'
import { useFormState } from '../useFormState'
import StepperViewRow from './StepperViewRow'

type StepperViewListProps = {
  onSkipToStep: (stepIndex: FormStepIndex) => void
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
            <AriaButton
              onPress={() => onSkipToStep(step.index)}
              data-cy={`stepper-step-${index + 1}`}
            >
              <StepperViewRow step={step} isCurrent={isCurrent} />
            </AriaButton>
          </li>
        )
      })}
    </ol>
  )
}

export default StepperViewList
