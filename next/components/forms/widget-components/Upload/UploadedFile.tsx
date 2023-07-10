import React from 'react'
import { Button } from 'react-aria-components'

import {
  FormFileUploadFileInfo,
  FormFileUploadStatusEnum,
} from '../../../../frontend/types/formFileUploadTypes'

type UploadedFileProps = {
  fileInfo: FormFileUploadFileInfo
  onFileRemove?: () => void
  onFileRetry?: () => void
}

/**
 * TODO: Visual implementation.
 */
const UploadedFile = ({ fileInfo, onFileRetry, onFileRemove }: UploadedFileProps) => {
  const fileSize = 500 // not yet implemented in FormFileUploadFileInfo
  return (
    <div>
      {fileInfo.fileName} <br />
      {fileInfo.status.type} <br />
      {fileSize} <br />
      {fileInfo.status.type === FormFileUploadStatusEnum.Uploading && (
        <>{fileInfo.status.progress} %</>
      )}
      {fileInfo.status.type === FormFileUploadStatusEnum.UploadError && (
        <>{fileInfo.status.error}</>
      )}
      {fileInfo.status.type === FormFileUploadStatusEnum.UploadError &&
        fileInfo.status.canRetry && <Button onPress={onFileRetry}>retry</Button>}
      <Button onPress={onFileRemove}>remove</Button>
    </div>
  )
}

export default UploadedFile
