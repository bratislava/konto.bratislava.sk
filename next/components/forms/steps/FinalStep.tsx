import { ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'
import { useTranslation } from 'next-i18next'

import { FileScan, JsonSchema } from '../../../frontend/dtos/formStepperDto'
import Alert from '../info-components/Alert'
import Summary from './Summary/Summary'
import SummaryMessages from './Summary/SummaryMessages'

interface FinalStepProps {
  formData: Record<string, JsonSchema>
  formErrors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  fileScans: FileScan[]
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
  fileScans,
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
      {fileScans.some(scan => scan.fileState === 'scan') && (
        <Alert type="warning" message={t('warnings.file_scan')} fullWidth className="mt-4"/>
      )}
      <Summary
        schema={schema}
        formData={formData}
        formErrors={formErrors}
        extraErrors={extraErrors}
        fileScans={fileScans}
        onGoToStep={onGoToStep}
      />
      <SummaryMessages errors={submitErrors} successMessage={submitMessage} />
    </div>
  )
}

export default FinalStep
