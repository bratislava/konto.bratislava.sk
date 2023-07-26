import { useTranslation } from 'next-i18next'

import { FormFileUploadFileInfo } from '../../../frontend/types/formFileUploadTypes'
import Alert from '../info-components/Alert'

type SummaryHeaderProps = {
  infectedFiles: FormFileUploadFileInfo[]
  scanningFiles: FormFileUploadFileInfo[]
  scanErrorFiles: FormFileUploadFileInfo[]
}

const SummaryHeader = ({ infectedFiles, scanErrorFiles }: SummaryHeaderProps) => {
  const { t } = useTranslation('forms')

  // TODO: Improve messages

  return (
    <>
      <h1 className="text-h1-medium font-semibold">{t('summary')}</h1>
      {infectedFiles.length === 1 && (
        <Alert
          type="error"
          message={t('errors.file_scan', { name: infectedFiles[0].fileName })}
          fullWidth
          className="mt-4"
          solid
        />
      )}
      {infectedFiles.length > 1 && (
        <Alert
          type="error"
          message={t('errors.file_scan_multiple', {
            name: infectedFiles.map((file) => file.fileName).join(', '),
          })}
          fullWidth
          className="mt-4"
          solid
        />
      )}
      {scanErrorFiles.length > 0 && (
        <Alert type="warning" message={t('warnings.file_scan')} fullWidth className="mt-4" />
      )}
    </>
  )
}

export default SummaryHeader
