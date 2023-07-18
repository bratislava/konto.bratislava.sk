import { useFormState } from '../FormStateProvider'
import { FormStepMetadata } from '../types/Steps'
import StepperViewRow from './StepperViewRow'

type StepperViewListProps = {
  onSkipToStep: (stepIndex: number | 'summary') => void
}
const StepperViewList = ({ onSkipToStep = () => {} }: StepperViewListProps) => {
  const { stepsMetadata, currentStepMetadata } = useFormState()

  return (
    <div>
      {stepsMetadata.map((step: FormStepMetadata, key: number) => (
        <StepperViewRow
          key={key}
          step={step}
          onClick={() => onSkipToStep(step.index)}
          isCurrent={step === currentStepMetadata}
          isButton
        />
      ))}
    </div>
  )
}

export default StepperViewList
