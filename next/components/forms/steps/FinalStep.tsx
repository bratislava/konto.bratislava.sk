import { formsApi } from '@backend/client/client-forms'
import { ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'
import { useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { FileScan, FileScanState, JsonSchema } from '../../../frontend/dtos/formStepperDto'
import useAccount from '../../../frontend/hooks/useAccount'
import logger, { developmentLog } from '../../../frontend/utils/logger'
import Summary from './Summary/Summary'
import SummaryMessages from './Summary/SummaryMessages'
import SummaryHeader from './SummaryHeader'

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
  fileScans = [],
  schema,
  onGoToStep,
  submitErrors,
  submitMessage,
  onUpdateFileScans,
}: FinalStepProps) => {
  const { getAccessToken } = useAccount()
  const [testedFileScans, setTestedFileScans] = useState<FileScan[]>(fileScans)

  const updateFileScans = async (): Promise<FileScan[]> => {
    const token = await getAccessToken()
    const unfinishedFileScans = fileScans.filter((scan) => scan.fileState !== 'finished')

    return Promise.all(
      unfinishedFileScans.map((scan: FileScan) => {
        if (
          (scan.fileStateStatus && ['INFECTED', 'SAFE'].includes(scan.fileStateStatus)) ||
          !scan.scanId
        ) {
          return scan
        }
        return formsApi
          .filesControllerGetFileScanStatus(scan.scanId, { accessToken: token })
          .then((response) => {
            const fileState: FileScanState = ['INFECTED', 'MOVE ERROR INFECTED'].includes(
              response.data.status,
            )
              ? 'error'
              : ['UPLOADED', 'ACCEPTED', 'NOT FOUND'].includes(response.data.status)
              ? 'scan'
              : 'finished'
            return { ...scan, fileState, fileStateStatus: response.data.status } as FileScan
          })
          .catch((error) => {
            logger.error('Fetch scan file statuses failed', error)
            return { ...scan, fileState: 'error' } as FileScan
          })
      }),
    )
  }

  const logAllFileScansOnDev = (updatedFileScans: FileScan[]) => {
    developmentLog('\nALL UPDATED FILES SCANS')
    updatedFileScans.forEach((scan) => {
      developmentLog('scan:', scan)
    })
  }

  useEffectOnce(() => {
    const interval = setInterval(() => {
      updateFileScans()
        .then((updatedFileScans: FileScan[]) => {
          logAllFileScansOnDev(updatedFileScans)
          onUpdateFileScans(updatedFileScans)
          setTestedFileScans(updatedFileScans)
          if (updatedFileScans.every((scan) => scan.fileState === 'finished')) {
            clearInterval(interval)
          }
          return true
        })
        .catch((error) => logger.error('Fetch scan file statuses failed', error))
    }, 30_000)

    return () => clearInterval(interval)
  })

  if (typeof formData !== 'object' || formData == null) {
    return null
  }

  return (
    <div>
      <SummaryHeader fileScans={testedFileScans} />
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
