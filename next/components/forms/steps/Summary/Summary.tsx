import { ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'

import { FileScan, JsonSchema } from '../../../../frontend/dtos/formStepperDto'
import { useFormDataTransform } from '../../../../frontend/utils/rjsfSchemaHandler'
import SummaryStep from './SummaryStep'
import { TransformedFormStep } from './TransformedFormData'

interface SummaryProps {
  formData: Record<string, JsonSchema>
  formErrors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  fileScans: FileScan[]
  schema?: StrictRJSFSchema
  onGoToStep: (step: number) => void
}

const Summary = ({ schema, formData, formErrors, extraErrors, fileScans, onGoToStep }: SummaryProps) => {
  const { transformedSteps } = useFormDataTransform(formData, formErrors, extraErrors, fileScans, schema)

  return (
    <div className="my-10">
      {transformedSteps.map((step: TransformedFormStep, key: number) => {
        return step.data.length > 0 ? (
          <SummaryStep key={key} step={step} onGoToStep={() => onGoToStep(key)} />
        ) : null
      })}
    </div>
  )
}

export default Summary
