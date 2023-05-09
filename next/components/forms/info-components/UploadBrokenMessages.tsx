import { useTranslation } from 'next-i18next'
import React from 'react'

import Alert from './Alert'

export const MINIO_ERROR = 'MINIO_ERROR'

interface UploadBrokenMessagesProps {
  fileBrokenMessages: string[]
}

const UploadBrokenMessages = ({ fileBrokenMessages }: UploadBrokenMessagesProps) => {
  const { t } = useTranslation('forms')
  const message = fileBrokenMessages.includes(MINIO_ERROR) ? t("errors.upload_minio") : t("errors.upload_size_format")

  return fileBrokenMessages.length > 0
    ? (
        <Alert
          className="mt-4"
          fullWidth
          type="error"
          message={message} />
      )
    : null
}

export default UploadBrokenMessages
