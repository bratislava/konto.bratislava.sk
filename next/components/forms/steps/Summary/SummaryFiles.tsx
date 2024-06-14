import { AlertIcon, AttachmentIcon, CheckInCircleIcon, ScanningIcon } from '@assets/ui-icons'
import {
  FileInfoSummary,
  isDoneFileStatusType,
  isErrorFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
} from '@forms-shared/form-files/fileStatus'
import cx from 'classnames'
import React from 'react'

import Spinner from '../../simple-components/Spinner'

type SummaryFileProps = {
  fileInfo: FileInfoSummary
}

const SummaryFile = ({ fileInfo }: SummaryFileProps) => {
  const isErrorStyle = isErrorFileStatusType(fileInfo.statusType)
  const isScanningStyle = isScanFileStatusType(fileInfo.statusType)
  const isDoneStyle = isDoneFileStatusType(fileInfo.statusType)
  const isUploadingStyle = isUploadFileStatusType(fileInfo.statusType)
  const isDefaultStyle = !isErrorStyle && !isDoneStyle && !isScanningStyle

  const Icon = (props: { 'data-cy': string }) =>
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

export default SummaryFile
