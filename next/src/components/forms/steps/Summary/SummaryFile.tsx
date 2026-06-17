import {
  FileInfoSummary,
  isDoneFileStatusType,
  isErrorFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
} from 'forms-shared/form-files/fileStatus'
import React, { useMemo } from 'react'

import Icon from '@/src/components/icon-components/Icon'
import Spinner from '@/src/components/simple-components/Spinner'
import cn from '@/src/utils/cn'

type SummaryFileProps = {
  fileInfo: FileInfoSummary
}

const SummaryFile = ({ fileInfo }: SummaryFileProps) => {
  const isErrorStyle = isErrorFileStatusType(fileInfo.statusType)
  const isScanningStyle = isScanFileStatusType(fileInfo.statusType)
  const isDoneStyle = isDoneFileStatusType(fileInfo.statusType)
  const isUploadingStyle = isUploadFileStatusType(fileInfo.statusType)

  const IconComponent = useMemo(() => {
    const props = { 'data-cy': 'summary-row-icon' }
    if (isErrorStyle) {
      return <Icon name="error" className="text-error" {...props} />
    }
    if (isScanningStyle) {
      return <Icon name="scan" {...props} />
    }
    if (isDoneStyle) {
      return <Icon name="check-circle" className="text-success-700" {...props} />
    }
    if (isUploadingStyle) {
      return <Spinner size="sm" className="size-6" {...props} />
    }

    return <Icon name="attachment" {...props} />
  }, [isErrorStyle, isScanningStyle, isDoneStyle, isUploadingStyle])

  return (
    <div className={cn('flex items-center gap-3', { 'text-error': isErrorStyle })}>
      <div className="shrink-0">{IconComponent}</div>
      {fileInfo.fileName}
    </div>
  )
}

export default SummaryFile
