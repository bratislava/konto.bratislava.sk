import { useTranslation } from 'next-i18next'

import { FileScan } from '../../../frontend/dtos/formStepperDto'
import Alert from '../info-components/Alert'

interface SummaryHeaderProps {
  fileScans: FileScan[]
}

const SummaryHeader = ({ fileScans }: SummaryHeaderProps) => {
  const { t } = useTranslation('forms')

  const errorFileScans: FileScan[] = fileScans.filter(scan => scan.fileState === 'error')
  const errorFileScansNames = errorFileScans.map(scan => scan.originalName).join(", ")

  return (
    <>
      <h1 className="text-h1-medium font-semibold">{t('summary')}</h1>
      {errorFileScans.length === 1 && (
        <Alert type="error" message={t('errors.file_scan')} fullWidth className="mt-4" solid/>
      )}
      {errorFileScans.length > 1 && (
        <Alert type="error"
               message={t('errors.file_scan_multiple', {name: errorFileScansNames})}
               fullWidth
               className="mt-4"
               solid/>
      )}
      {fileScans.some(scan => scan.fileState === 'scan') && (
        <Alert type="warning" message={t('warnings.file_scan')} fullWidth className="mt-4"/>
      )}
    </>
  )
}

export default SummaryHeader
