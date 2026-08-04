import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { useFormSummary } from '@/src/components/forms/steps/Summary/useFormSummary'
import { useFormContext } from '@/src/components/forms/useFormContext'
import TemporarilyDisabledAlert from '@/src/components/segments/TemporarilyDisabledAlert/TemporarilyDisabledAlert'
import Alert from '@/src/components/simple-components/Alert'

const SummaryHeader = () => {
  const { isSigned, strapiForm } = useFormContext()
  const { getValidatedSummary, getInfectedFiles, getUploadFiles } = useFormSummary()
  const { hasErrors } = getValidatedSummary()
  const infectedFiles = getInfectedFiles()
  const uploadFiles = getUploadFiles()
  const { t } = useTranslation('account')

  const infectedFilesFilenames = infectedFiles.map((file) => file.fileName)

  return (
    <>
      <TemporarilyDisabledAlert strapiForm={strapiForm} variant="form" />

      <Typography variant="h2">{t('forms.summary.title')}</Typography>

      <div className="flex flex-col gap-4">
        {hasErrors && (
          <Alert
            type="error"
            message={
              isSigned
                ? t('forms.summary.form_has_errors_signed')
                : t('forms.summary.form_has_errors')
            }
            fullWidth
          />
        )}
        {infectedFiles.length === 1 && (
          <Alert
            type="error"
            message={t('forms.summary.virus_alert', {
              file: infectedFilesFilenames[0],
            })}
            fullWidth
          />
        )}
        {infectedFiles.length > 1 && (
          <Alert
            type="error"
            message={t('forms.summary.virus_alert_plural', {
              files: infectedFilesFilenames.map((name) => `“${name}“`).join(', '),
            })}
            fullWidth
          />
        )}
        {uploadFiles.length > 0 && (
          <Alert
            type="warning"
            message={t('forms.summary.uploading_files', {
              files: uploadFiles.map((file) => file.fileName).join(', '),
            })}
            fullWidth
          />
        )}
      </div>
    </>
  )
}

export default SummaryHeader
