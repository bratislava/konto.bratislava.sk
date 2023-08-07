import { useFormState } from '../FormStateProvider'
import { FormStepperStep } from '../types/Steps'
import StepperViewRow from './StepperViewRow'

type StepperViewListProps = {
  onSkipToStep: (stepIndex: number | 'summary') => void
}
const StepperViewList = ({ onSkipToStep = () => {} }: StepperViewListProps) => {
  const { stepperData, currentStepperStep } = useFormState()

  return (
    <ol>
      {stepperData.map((step: FormStepperStep, key: number) => (
        <StepperViewRow
          key={key}
          step={step}
          onClick={() => onSkipToStep(step.index)}
          isCurrent={step === currentStepperStep}
          isButton
        />
      ))}
    </ol>
  )
}

export default StepperViewList
