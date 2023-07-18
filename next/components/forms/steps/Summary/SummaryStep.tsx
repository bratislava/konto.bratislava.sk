import SummaryRow, { SummaryRowData } from './SummaryRow'

export interface SummaryStep {
  key: string
  label: string
  data: SummaryRowData[]
}

interface SummaryStepProps {
  step: SummaryStep
  onGoToStep: () => void
}

const SummaryStep = ({ step, onGoToStep }: SummaryStepProps) => {
  return (
    <div>
      <h2 className="text-h2-medium mb-6 mt-8">{step.label ?? step.key}</h2>
      <div>
        {step.data
          .filter((stepData) => {
            return (
              !stepData.isConditional ||
              (stepData.isConditional && (stepData.value || stepData.isError))
            )
          })
          .map((stepData, key: number) => {
            return stepData ? (
              <SummaryRow key={key} data={stepData} onGoToStep={onGoToStep} isEditable />
            ) : null
          })}
      </div>
    </div>
  )
}

export default SummaryStep
