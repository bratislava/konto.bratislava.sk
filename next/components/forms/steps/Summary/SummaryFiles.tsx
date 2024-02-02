import { AlertIcon, AttachmentIcon, CheckInCircleIcon, ScanningIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React from 'react'

import { FormFileUploadStatusEnum } from '../../../../frontend/types/formFileUploadTypes'
import Spinner from '../../simple-components/Spinner'
import { useFormFileUpload } from '../../useFormFileUpload'

type SummaryFileProps = {
  file: string
}

const SummaryFile = ({ file }: SummaryFileProps) => {
  const { getFileInfoById } = useFormFileUpload()
  const fileInfo = getFileInfoById(file)

  const isErrorStyle =
    fileInfo.status.type === FormFileUploadStatusEnum.UploadError ||
    fileInfo.status.type === FormFileUploadStatusEnum.ScanError ||
    fileInfo.status.type === FormFileUploadStatusEnum.ScanInfected ||
    fileInfo.status.type === FormFileUploadStatusEnum.UnknownFile
  const isScanningStyle = fileInfo.status.type === FormFileUploadStatusEnum.Scanning
  const isDoneStyle = fileInfo.status.type === FormFileUploadStatusEnum.ScanDone
  const isUploadingStyle = fileInfo.status.type === FormFileUploadStatusEnum.Uploading
  const isDefaultStyle = !isErrorStyle && !isDoneStyle && !isScanningStyle

  const Icon = (props) =>
    isErrorStyle ? (
      <AlertIcon className="text-error" {...props} />
    ) : isScanningStyle ? (
      <ScanningIcon {...props} />
    ) : isDoneStyle ? (
      <CheckInCircleIcon className="text-success-700" {...props} />
    ) : isUploadingStyle ? (
      <Spinner size="sm" className="h-6 w-6" {...props} />
    ) : isDefaultStyle ? (
      <AttachmentIcon {...props} />
    ) : null

  return (
    <div className={cx('flex items-center gap-3', { 'text-error': isErrorStyle })}>
      <Icon data-cy="summary-row-icon" />
      {fileInfo.fileName}
    </div>
  )
}

type SummaryFilesProps = {
  files: string | string[]
}

const SummaryFiles = ({ files }: SummaryFilesProps) => {
  const filesArray = Array.isArray(files) ? files : [files]

  return (
    <div className="flex flex-col gap-2">
      {filesArray.map((file, index) => (
        <SummaryFile file={file} key={index} />
      ))}
    </div>
  )
}

export default SummaryFiles
