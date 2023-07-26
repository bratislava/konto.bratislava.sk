import { useTranslation } from 'next-i18next'
import React from 'react'

import { FormFileUploadFileInfo } from '../../../../frontend/types/formFileUploadTypes'
import { isDefined } from '../../../../frontend/utils/general'
import UploadFileCard from './UploadFileCard'

interface UploadedFilesListProps {
  value?: string | string[] | null
  getFileInfoById: (id: string) => FormFileUploadFileInfo
  onFileRemove?: (id: string) => void
  onFileRetry?: (id: string) => void
  onFileDownload?: (id: string) => void
}

const UploadFilesList = ({
  value,
  getFileInfoById,
  onFileRetry = () => {},
  onFileRemove = () => {},
  onFileDownload = () => {},
}: UploadedFilesListProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'Upload' })

  let valueArray: string[] = []
  if (value) {
    valueArray = Array.isArray(value) ? value : [value]
  }

  if (valueArray.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* TODO accordion, "x of n" info */}
      <div>
        <h3 className="text-p1-semibold">{t('uploadingList')}</h3>
      </div>

      <ul className="flex flex-col gap-2">
        {valueArray.filter(isDefined).map((fileId) => (
          <li key={fileId}>
            <UploadFileCard
              fileInfo={getFileInfoById(fileId)}
              onFileRetry={() => onFileRetry(fileId)}
              onFileRemove={() => onFileRemove(fileId)}
              onFileDownload={() => onFileDownload(fileId)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UploadFilesList
