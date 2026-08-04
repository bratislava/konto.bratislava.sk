import { Button, Typography } from '@bratislava/component-library'
import {
  FileInfo,
  FileStatusType,
  isDoneFileStatusType,
  isDownloadableFileStatusType,
  isErrorFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
  UploadClientErrorReasonType,
} from 'forms-shared/form-files/fileStatus'
import { useTranslation } from 'next-i18next/pages'

import Icon from '@/src/components/icon-components/Icon'
import PrettyBytes from '@/src/components/simple-components/PrettyBytes'
import ProgressBar from '@/src/components/simple-components/ProgressBar'
import cn from '@/src/utils/cn'

type UploadedFileProps = {
  fileInfo: FileInfo
  onFileRemove?: () => void
  onFileRetry?: () => void
  onFileDownload?: () => void
  isDisabled?: boolean
}

const useGetErrorMessage = (fileInfo: FileInfo) => {
  const { t } = useTranslation('account')
  const { status } = fileInfo

  if (!isErrorFileStatusType(status.type)) {
    return null
  }

  if (status.type === FileStatusType.UploadClientError) {
    if (status.reason.type === UploadClientErrorReasonType.LargeFile) {
      return t('UploadFileCard.errors.largeFile', {
        maxFileSize: status.reason.maxFileSize,
      })
    }

    if (status.reason.type === UploadClientErrorReasonType.InvalidFileType) {
      return t('UploadFileCard.errors.invalidFileType', {
        supportedFormats: status.reason.supportedFormats.join(', '),
      })
    }
  }

  // TODO: Handle server error messages, they don't have useful meanings for the user or are already handled by the client
  // (max file size, invalid file type).
  return (
    {
      [FileStatusType.ScanInfected]: t('UploadFileCard.errors.scanInfected'),
      [FileStatusType.ScanError]: t('UploadFileCard.errors.scanError'),
    }[status.type] ?? t('UploadFileCard.errors.unknownError')
  )
}

const useGetMessage = (fileInfo: FileInfo) => {
  const { t } = useTranslation('account')
  const { status } = fileInfo

  return (
    {
      [FileStatusType.UploadQueued]: t('UploadFileCard.messages.uploadQueued'),
      [FileStatusType.Uploading]: t('UploadFileCard.messages.uploading'),
      [FileStatusType.WaitingForScan]: t('UploadFileCard.messages.waitingForScan'),
      [FileStatusType.Scanning]: t('UploadFileCard.messages.scanning'),
    }[status.type] ?? null
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16743-7965&m=dev
 */

const UploadFileCard = ({
  fileInfo,
  onFileRetry,
  onFileRemove,
  onFileDownload,
  isDisabled = false,
}: UploadedFileProps) => {
  const { t } = useTranslation('account')
  const errorMessage = useGetErrorMessage(fileInfo)
  const message = useGetMessage(fileInfo)

  const statusType = fileInfo.status.type
  const isScanStatus = isScanFileStatusType(statusType)
  const isDoneStatus = isDoneFileStatusType(statusType)
  const isErrorStatus = isErrorFileStatusType(statusType)
  const isUploadStatus = isUploadFileStatusType(statusType)
  const isDownloadable = isDownloadableFileStatusType(statusType)

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={cn('flex w-full items-start gap-4 rounded-lg border p-4', {
          'bg-white': isUploadStatus || isScanStatus,
          'border-success-700 bg-success-50': isDoneStatus,
          'border-negative-600 bg-negative-50': isErrorStatus,
        })}
      >
        <div
          className={cn('shrink-0 grow-0 rounded-lg p-3 max-md:hidden', {
            'bg-gray-50': isUploadStatus || isScanStatus,
            'bg-white': isErrorStatus || isDoneStatus,
          })}
        >
          {isErrorStatus ? (
            <Icon name="error" className="text-error" />
          ) : isScanStatus ? (
            <Icon name="scan" />
          ) : isDoneStatus ? (
            <Icon name="check-circle" className="text-success-700" />
          ) : (
            <Icon name="attachment" />
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex grow flex-col">
              <Typography variant="p-small" as="h3" className="break-all">
                {fileInfo.fileName}
              </Typography>
              <div className="flex gap-2">
                {/* TODO Translations - download aria label size and format */}
                {isDownloadable && (
                  <Button
                    variant="icon-wrapped-negative-margin"
                    icon={<Icon name="download" />}
                    aria-label={t('UploadFileCard.aria.download')}
                    onPress={onFileDownload}
                  />
                )}
                {fileInfo.fileSize != null && (
                  <span>
                    <PrettyBytes number={fileInfo.fileSize} />
                  </span>
                )}
                {message && (
                  <>
                    <span>&bull;</span>
                    <span>{message}</span>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 grow-0">
              {/* TODO unified styling */}
              <Button
                variant="icon-wrapped-negative-margin"
                icon={<Icon name="close-circle" />}
                aria-label={t('UploadFileCard.aria.removeFile')}
                className={cn('relative', {
                  'hover:bg-negative-200 focus:bg-negative-300': isErrorStatus,
                  'hover:bg-success-200 focus:bg-success-300': isDoneStatus,
                })}
                onPress={onFileRemove}
                isDisabled={isDisabled}
              />
            </div>
          </div>

          {statusType === FileStatusType.Uploading && (
            <ProgressBar value={fileInfo.status.progress} />
          )}
        </div>
      </div>

      {isErrorStatus && (
        <div className="flex justify-between gap-6 pb-2">
          {errorMessage && <div className="max-w-[80%] text-error">{errorMessage}</div>}

          {'canRetry' in fileInfo.status && fileInfo.status.canRetry && (
            <Button
              variant="link"
              onPress={onFileRetry}
              size="small"
              className="font-semibold"
              isDisabled={isDisabled}
            >
              {t('UploadFileCard.retry')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default UploadFileCard
