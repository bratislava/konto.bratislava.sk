import { ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'
import { useTranslation } from 'next-i18next'

import { JsonSchema } from '../../../frontend/dtos/formStepperDto'
import Alert from '../info-components/Alert'
import Summary from './Summary/Summary'
import SummaryMessages from './Summary/SummaryMessages'

interface FinalStepProps {
  formData: Record<string, JsonSchema>
  formErrors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  schema?: StrictRJSFSchema
  onGoToStep: (step: number) => void
  submitErrors?: Array<ErrorObject | string>
  submitMessage?: string | null
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
  const { t } = useTranslation('forms')

  if (typeof formData !== 'object' || formData == null) {
    return null
  }

  return (
    <div>
      <h1 className="text-h1-medium font-semibold">{t('summary')}</h1>
      <Alert type="warning" message={t('warnings.file_scan')} fullWidth className="mt-4"/>
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
