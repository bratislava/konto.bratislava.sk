import React from 'react'

import { FormFileUploadFileInfo } from '../../../../frontend/types/formFileUploadTypes'
import { isDefined } from '../../../../frontend/utils/general'
import UploadedFile from './UploadedFile'

interface UploadedFilesListProps {
  value?: string | string[] | null
  getFileInfoById: (id: string) => FormFileUploadFileInfo
  onFileRemove?: (id: string) => void
  onFileRetry?: (id: string) => void
}

const UploadedFilesList = ({
  value,
  getFileInfoById,
  onFileRetry = () => {},
  onFileRemove = () => {},
}: UploadedFilesListProps) => {
  const valueArray = Array.isArray(value) ? value : [value]

  return (
    <div>
      {valueArray.filter(isDefined).map((fileId) => (
        <UploadedFile
          key={fileId}
          fileInfo={getFileInfoById(fileId)}
          onFileRetry={() => onFileRetry(fileId)}
          onFileRemove={() => onFileRemove(fileId)}
        />
      ))}
    </div>
  )
}

export default UploadedFilesList
