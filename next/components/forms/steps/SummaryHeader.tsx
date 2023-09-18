import { useTranslation } from 'next-i18next'

import Alert from '../info-components/Alert'
import { useFormSummary } from './Summary/useFormSummary'

const SummaryHeader = () => {
  const { infectedFiles, uploadingFiles, hasErrors } = useFormSummary()
  const { t } = useTranslation('forms')

  const infectedFilesFilenames = infectedFiles.map((file) => file.fileName)

  return (
    <>
      <h1 className="text-h1-medium font-semibold">{t('summary.title')}</h1>
      {hasErrors && (
        <Alert type="error" message={t('summary.form_has_errors')} fullWidth className="mt-4" />
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
      {uploadingFiles.length > 0 && (
        <Alert
          type="warning"
          message={t('summary.uploading_files', {
            files: uploadingFiles.map((file) => file.fileName).join(', '),
          })}
          fullWidth
          className="mt-4"
        />
      )}
    </>
  )
}

export default SummaryHeader
