import React from 'react'

import { FormFileUploadFileInfo } from '../../../../frontend/types/formFileUploadTypes'
import { isDefined } from '../../../../frontend/utils/general'
import UploadFileCard from './UploadFileCard'

interface UploadedFilesListProps {
  value?: string | string[] | null
  getFileInfoById: (id: string) => FormFileUploadFileInfo
  onFileRemove?: (id: string) => void
  onFileRetry?: (id: string) => void
}

const UploadFilesList = ({
  value,
  getFileInfoById,
  onFileRetry = () => {},
  onFileRemove = () => {},
}: UploadedFilesListProps) => {
  const valueArray = Array.isArray(value) ? value : [value]

  return (
    <ul>
      {valueArray.filter(isDefined).map((fileId) => (
        <li>
          <UploadFileCard
            key={fileId}
            fileInfo={getFileInfoById(fileId)}
            onFileRetry={() => onFileRetry(fileId)}
            onFileRemove={() => onFileRemove(fileId)}
          />
        </li>
      ))}
    </ul>
  )
}

export default UploadFilesList
