import { FileInfo } from 'forms-shared/form-files/fileStatus'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { isDefined } from '../../../../frontend/utils/general'
import UploadFileCard from './UploadFileCard'

interface UploadedFilesListProps {
  value?: string | string[] | null
  getFileInfoById: (id: string) => FileInfo
  onFileRemove?: (id: string) => void
  onFileRetry?: (id: string) => void
  onFileDownload?: (id: string) => void
  disabled?: boolean
}

const UploadFilesList = ({
  value,
  getFileInfoById,
  onFileRetry = () => {},
  onFileRemove = () => {},
  onFileDownload = () => {},
  disabled = false,
}: UploadedFilesListProps) => {
  const { t } = useTranslation('account')

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
        <h3 className="text-p1-semibold">{t('Upload.uploadingList')}</h3>
      </div>

      <ul className="flex flex-col gap-2">
        {valueArray.filter(isDefined).map((fileId) => (
          <li key={fileId}>
            <UploadFileCard
              fileInfo={getFileInfoById(fileId)}
              onFileRetry={() => onFileRetry(fileId)}
              onFileRemove={() => onFileRemove(fileId)}
              onFileDownload={() => onFileDownload(fileId)}
              disabled={disabled}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UploadFilesList
