import { ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'

import { JsonSchema } from '../../../frontend/dtos/formStepperDto'
import Summary from './Summary/Summary'
import SummaryMessages from './Summary/SummaryMessages'
import SummaryHeader from './SummaryHeader'

interface FinalStepProps {
  formData: Record<string, JsonSchema>
  formErrors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  schema?: StrictRJSFSchema
  submitErrors?: Array<ErrorObject | string>
  submitMessage?: string | null
  onGoToStep: (step: number) => void
}

// TODO find out if we need to submit to multiple different endpoints and allow configuration if so
const FinalStep = ({
  formData,
  formErrors,
  extraErrors,
  schema,
  onGoToStep,
  submitErrors,
  submitMessage,
}: FinalStepProps) => {
  if (typeof formData !== 'object' || formData == null) {
    return null
  }

  return (
    <div>
      <SummaryHeader />
      <Summary
        schema={schema}
        formData={formData}
        formErrors={formErrors}
        extraErrors={extraErrors}
        onGoToStep={onGoToStep}
      />
      <SummaryMessages errors={submitErrors} successMessage={submitMessage} />
    </div>
  )
}

export default FinalStep
