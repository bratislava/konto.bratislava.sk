import React from 'react'
import { Button as AriaButton } from 'react-aria-components'

import cn from '../../../frontend/cn'
import { FormStepIndex, FormStepperStep } from '../types/Steps'
import { useFormState } from '../useFormState'
import StepperViewRow from './StepperViewRow'
import { useFormSummary } from './Summary/useFormSummary'

type StepperViewListProps = {
  onSkipToStep: (stepIndex: FormStepIndex) => void
}
const StepperViewList = ({ onSkipToStep = () => {} }: StepperViewListProps) => {
  const { stepperData, currentStepperStep } = useFormState()
  const { precalculateSummary } = useFormSummary()

  return (
    <ol>
      {stepperData.map((step: FormStepperStep, index: number) => {
        const isLast = index === stepperData.length - 1
        const isCurrent = step === currentStepperStep
        const isSummary = step.index === 'summary'

        return (
          <li
            className={cn({
              'relative after:my-2 after:ml-[15px] after:block after:h-4 after:w-0.5 after:bg-gray-300':
                !isLast,
            })}
            key={index}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <AriaButton
              onPress={() => onSkipToStep(step.index)}
              data-cy={`stepper-step-${index + 1}`}
              className="w-full"
              onHoverStart={isSummary ? precalculateSummary : undefined}
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
