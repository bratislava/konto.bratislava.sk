import { useTranslation } from 'next-i18next'
import React from 'react'

import Alert from './Alert'

export const MINIO_ERROR = 'MINIO_ERROR'

interface UploadBrokenMessagesProps {
  fileBrokenMessages: string[]
}

const UploadBrokenMessages = ({ fileBrokenMessages }: UploadBrokenMessagesProps) => {
  const { t } = useTranslation('forms')

  return (
    <>
      {fileBrokenMessages.includes(MINIO_ERROR) && (
        <Alert
          className="mt-4"
          fullWidth
          type="error"
          message={t("errors.upload_size_format")} />
      )}
      {fileBrokenMessages.length > fileBrokenMessages.filter(message => message === MINIO_ERROR).length && (
        <Alert
          className="mt-4"
          fullWidth
          type="error"
          message={t("errors.upload_size_format")} />
      )}
    </>
  )
}

export default UploadBrokenMessages
