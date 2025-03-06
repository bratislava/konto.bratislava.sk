import { AlertIcon, AttachmentIcon, CheckInCircleIcon, ScanningIcon } from '@assets/ui-icons'
import {
  FileInfoSummary,
  isDoneFileStatusType,
  isErrorFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
} from 'forms-shared/form-files/fileStatus'
import React, { useMemo } from 'react'

import cn from '../../../../frontend/cn'
import Spinner from '../../simple-components/Spinner'

type SummaryFileProps = {
  fileInfo: FileInfoSummary
}

const SummaryFile = ({ fileInfo }: SummaryFileProps) => {
  const isErrorStyle = isErrorFileStatusType(fileInfo.statusType)
  const isScanningStyle = isScanFileStatusType(fileInfo.statusType)
  const isDoneStyle = isDoneFileStatusType(fileInfo.statusType)
  const isUploadingStyle = isUploadFileStatusType(fileInfo.statusType)

  const Icon = useMemo(() => {
    const props = { 'data-cy': 'summary-row-icon' }
    if (isErrorStyle) {
      return <AlertIcon className="text-error" {...props} />
    }
    if (isScanningStyle) {
      return <ScanningIcon {...props} />
    }
    if (isDoneStyle) {
      return <CheckInCircleIcon className="text-success-700" {...props} />
    }
    if (isUploadingStyle) {
      return <Spinner size="sm" className="size-6" {...props} />
    }
    return <AttachmentIcon {...props} />
  }, [isErrorStyle, isScanningStyle, isDoneStyle, isUploadingStyle])

  return (
    <div className={cn('flex items-center gap-3', { 'text-error': isErrorStyle })}>
      <div className="shrink-0">{Icon}</div>
      {fileInfo.fileName}
    </div>
  )
}

export default SummaryFile
