import { useTranslation } from 'next-i18next'

import { useFormState } from '../FormStateProvider'
import { StepData } from '../types/TransformedFormData'
import StepperViewRow from './StepperViewRow'

type StepperViewListProps = {
  onSkipToStep: (stepIndex: number | 'summary') => void
}
const StepperViewList = ({ onSkipToStep = () => {} }: StepperViewListProps) => {
  const { stepData, currentStepData } = useFormState()

  return (
    <div>
      {stepData.map((step: StepData, key: number) => (
        <StepperViewRow
          key={key}
          step={step}
          onClick={() => onSkipToStep(step.index)}
          isCurrent={step === currentStepData}
          isButton
        />
      ))}
    </div>
  )
}

export default StepperViewList
