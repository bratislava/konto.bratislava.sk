import StepperViewRow from '@/src/components/forms/steps/StepperViewRow'
import { useFormSummary } from '@/src/components/forms/steps/Summary/useFormSummary'
import { FormStepIndex, FormStepperStep } from '@/src/components/forms/steps/types/Steps'
import { useFormState } from '@/src/components/forms/useFormState'
import Button from '@/src/components/simple-components/Button'
import cn from '@/src/utils/cn'

type StepperViewListProps = {
  onSkipToStep: (stepIndex: FormStepIndex) => void
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-11155
 */

const StepperViewList = ({ onSkipToStep }: StepperViewListProps) => {
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
            <Button
              onPress={() => onSkipToStep(step.index)}
              data-cy={`stepper-step-${index + 1}`}
              className="w-full"
              onHoverStart={isSummary ? precalculateSummary : undefined}
            >
              <StepperViewRow step={step} isCurrent={isCurrent} />
            </Button>
          </li>
        )
      })}
    </ol>
  )
}

export default StepperViewList
