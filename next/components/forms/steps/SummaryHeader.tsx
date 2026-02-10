import { useTranslation } from 'next-i18next'

import Alert from '@/components/forms/info-components/Alert'

import { useFormContext } from '../useFormContext'
import { useFormSummary } from './Summary/useFormSummary'

const SummaryHeader = () => {
  const { isSigned } = useFormContext()
  const { getValidatedSummary, getInfectedFiles, getUploadFiles } = useFormSummary()
  const { hasErrors } = getValidatedSummary()
  const infectedFiles = getInfectedFiles()
  const uploadFiles = getUploadFiles()
  const { t } = useTranslation('forms')

  const infectedFilesFilenames = infectedFiles.map((file) => file.fileName)

  return (
    <>
      <h2 className="text-h2">{t('summary.title')}</h2>
      {hasErrors && (
        <Alert
          type="error"
          message={isSigned ? t('summary.form_has_errors_signed') : t('summary.form_has_errors')}
          fullWidth
          className="mt-4"
        />
      )}
      {infectedFiles.length === 1 && (
        <Alert
          type="error"
          message={t('summary.virus_alert', {
            file: infectedFilesFilenames[0],
          })}
          fullWidth
          className="mt-4"
        />
      )}
      {infectedFiles.length > 1 && (
        <Alert
          type="error"
          message={t('summary.virus_alert_plural', {
            files: infectedFilesFilenames.map((name) => `“${name}“`).join(', '),
          })}
          fullWidth
          className="mt-4"
        />
      )}
      {uploadFiles.length > 0 && (
        <Alert
          type="warning"
          message={t('summary.uploading_files', {
            files: uploadFiles.map((file) => file.fileName).join(', '),
          })}
          fullWidth
          className="mt-4"
        />
      )}
    </>
  )
}

export default SummaryHeader
