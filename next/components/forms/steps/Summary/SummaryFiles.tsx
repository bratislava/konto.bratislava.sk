import { AlertIcon, AttachmentIcon, CheckInCircleIcon, ScanningIcon } from '@assets/ui-icons'
import {
  isDoneFileStatusType,
  isErrorFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
} from '@forms-shared/form-files/fileStatus'
import cx from 'classnames'
import React from 'react'

import Spinner from '../../simple-components/Spinner'
import { useFormFileUpload } from '../../useFormFileUpload'

type SummaryFileProps = {
  file: string
}

export const SummaryFile = ({ file }: SummaryFileProps) => {
  const { getFileInfoById } = useFormFileUpload()
  const fileInfo = getFileInfoById(file)

  const isErrorStyle = isErrorFileStatusType(fileInfo.status.type)
  const isScanningStyle = isScanFileStatusType(fileInfo.status.type)
  const isDoneStyle = isDoneFileStatusType(fileInfo.status.type)
  const isUploadingStyle = isUploadFileStatusType(fileInfo.status.type)
  const isDefaultStyle = !isErrorStyle && !isDoneStyle && !isScanningStyle

  const Icon = (props) =>
    isErrorStyle ? (
      <AlertIcon className="text-error" {...props} />
    ) : isScanningStyle ? (
      <ScanningIcon {...props} />
    ) : isDoneStyle ? (
      <CheckInCircleIcon className="text-success-700" {...props} />
    ) : isUploadingStyle ? (
      <Spinner size="sm" className="size-6" {...props} />
    ) : isDefaultStyle ? (
      <AttachmentIcon {...props} />
    ) : null

  return (
    <div className={cx('flex items-center gap-3', { 'text-error': isErrorStyle })}>
      <div className="shrink-0">
        <Icon data-cy="summary-row-icon" />
      </div>
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
