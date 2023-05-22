import { ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { getFileScanState } from '../../../frontend/api/api'
import { FileScan, FileScanResponse, FileScanState, JsonSchema } from '../../../frontend/dtos/formStepperDto'
import useAccount from '../../../frontend/hooks/useAccount'
import logger, { developmentLog } from '../../../frontend/utils/logger'
import Alert from '../info-components/Alert'
import Summary from './Summary/Summary'
import SummaryMessages from './Summary/SummaryMessages'

interface FinalStepProps {
  formData: Record<string, JsonSchema>
  formErrors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  fileScans: FileScan[]
  schema?: StrictRJSFSchema
  submitErrors?: Array<ErrorObject | string>
  submitMessage?: string | null
  onGoToStep: (step: number) => void
  onUpdateFileScans: (updatedScans: FileScan[]) => void
}

// TODO find out if we need to submit to multiple different endpoints and allow configuration if so
const FinalStep = ({
  formData,
  formErrors,
  extraErrors,
  fileScans=[],
  schema,
  onGoToStep,
  submitErrors,
  submitMessage,
  onUpdateFileScans
}: FinalStepProps) => {
  const { t } = useTranslation('forms')
  const { getAccessToken } = useAccount()
  const [testedFileScans, setTestedFileScans] = useState<FileScan[]>(fileScans)

  const updateFileScans = async (): Promise<FileScan[]> => {
    const token = await getAccessToken()
    return Promise.all(
      fileScans.map((scan: FileScan) => {
        return getFileScanState(token, scan.scanId)
          .then((res: FileScanResponse) => {
            const fileState: FileScanState = ['INFECTED', 'MOVE ERROR INFECTED'].includes(res.status)
              ? 'error'
              : ['UPLOADED', 'ACCEPTED', 'NOT FOUND'].includes(res.status)
                ? 'scan'
                : 'finished'
            return { ...scan, fileState, fileStateStatus: res.status } as FileScan
          })
          .catch(error => {
            logger.error("Fetch scan file statuses failed", error)
            return { ...scan, fileState: 'scan' } as FileScan
          })
      })
    )
  }

  const logAllFileScansOnDev = (updatedFileScans: FileScan[]) => {
    developmentLog('\nALL UPDATED FILES SCANS')
    updatedFileScans.forEach(scan => {
      developmentLog("scan:", scan)
    })
  }

  useEffectOnce(() => {
    updateFileScans()
      .then((updatedFileScans: FileScan[]) => {
        logAllFileScansOnDev(updatedFileScans)
        onUpdateFileScans(updatedFileScans)
        setTestedFileScans(updatedFileScans)
        return true
      })
      .catch(error => logger.error("Fetch scan file statuses failed", error))
  })

  if (typeof formData !== 'object' || formData == null) {
    return null
  }

  return (
    <div>
      <h1 className="text-h1-medium font-semibold">{t('summary')}</h1>
      {testedFileScans.some(scan => scan.fileState === 'error') && (
        <Alert type="error" message={t('errors.file_scan')} fullWidth className="mt-4" solid/>
      )}
      {testedFileScans.some(scan => scan.fileState === 'scan') && (
        <Alert type="warning" message={t('warnings.file_scan')} fullWidth className="mt-4"/>
      )}
      <Summary
        schema={schema}
        formData={formData}
        formErrors={formErrors}
        extraErrors={extraErrors}
        fileScans={testedFileScans}
        onGoToStep={onGoToStep}
      />
      <SummaryMessages errors={submitErrors} successMessage={submitMessage} />
    </div>
  )
}

export default FinalStep
