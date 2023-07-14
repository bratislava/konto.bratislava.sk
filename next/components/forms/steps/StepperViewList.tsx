import { useTranslation } from 'next-i18next'

import { StepData } from '../types/TransformedFormData'
import StepperViewRow from './StepperViewRow'

interface StepperViewListProps {
  steps: StepData[]
  currentStep: number | 'summary'
  onChangeStep?: (step: number | 'summary') => void
}

const StepperViewList = ({ steps, currentStep, onChangeStep = () => {} }: StepperViewListProps) => {
  const { t } = useTranslation('forms')

  return (
    <div>
      {steps.map((step: StepData, key: number) => (
        <StepperViewRow
          key={key}
          title={step.title}
          order={key + 1}
          isCurrent={step.index === currentStep}
          isFilled={step.isFilled}
          onClick={() => onChangeStep(step.index)}
          isButton
        />
      ))}
      <StepperViewRow
        order={steps.length + 1}
        title={t('summary')}
        isLast
        isCurrent={currentStep === 'summary'}
        onClick={() => onChangeStep('summary')}
        isButton
      />
    </div>
  )
}

export default StepperViewList
