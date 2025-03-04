import {
  AttachmentIcon,
  CheckInCircleIcon,
  CrossInCircleIcon,
  DownloadIcon,
  ErrorIcon,
  ScanningIcon,
} from '@assets/ui-icons'
import cx from 'classnames'
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
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button as ReactAriaButton } from 'react-aria-components'

import Button from '../../simple-components/Button'
import ButtonNew from '../../simple-components/ButtonNew'
import PrettyBytes from '../../simple-components/PrettyBytes'
import ProgressBar from '../../simple-components/ProgressBar'

type UploadedFileProps = {
  fileInfo: FileInfo
  onFileRemove?: () => void
  onFileRetry?: () => void
  onFileDownload?: () => void
  disabled?: boolean
}

const useGetErrorMessage = (fileInfo: FileInfo) => {
  const { t } = useTranslation('account', { keyPrefix: 'Upload' })
  const { status } = fileInfo

  if (!isErrorFileStatusType(status.type)) {
    return null
  }

  if (status.type === FileStatusType.UploadClientError) {
    if (status.reason.type === UploadClientErrorReasonType.LargeFile) {
      return t('errors.large_file', {
        maxFileSize: status.reason.maxFileSize,
      })
    }

    if (status.reason.type === UploadClientErrorReasonType.InvalidFileType) {
      return t('errors.invalid_file_type', {
        supportedFormats: status.reason.supportedFormats.join(', '),
      })
    }
  }

  // TODO: Handle server error messages, they don't have useful meanings for the user or are already handled by the client
  // (max file size, invalid file type).
  return (
    {
      [FileStatusType.ScanInfected]: t('errors.scan_infected'),
      [FileStatusType.ScanError]: t('errors.scan_error'),
    }[status.type] ?? t('errors.unknown_error')
  )
}

const useGetMessage = (fileInfo: FileInfo) => {
  const { t } = useTranslation('account', { keyPrefix: 'Upload' })
  const { status } = fileInfo

  return (
    {
      [FileStatusType.UploadQueued]: t('messages.upload_queued'),
      [FileStatusType.Uploading]: t('messages.uploading'),
      [FileStatusType.WaitingForScan]: t('messages.waiting_for_scan'),
      [FileStatusType.Scanning]: t('messages.scanning'),
    }[status.type] ?? null
  )
}

const UploadFileCard = ({
  fileInfo,
  onFileRetry,
  onFileRemove,
  onFileDownload,
  disabled = false,
}: UploadedFileProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'Upload' })
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
        className={cx('flex w-full items-start gap-4 rounded-lg border-2 p-4', {
          'bg-white': isUploadStatus || isScanStatus,
          'border-success-700 bg-success-50': isDoneStatus,
          'border-negative-600 bg-negative-50': isErrorStatus,
        })}
      >
        <div
          className={cx('shrink-0 grow-0 rounded-lg p-3 max-md:hidden', {
            'bg-gray-50': isUploadStatus || isScanStatus,
            'bg-white': isErrorStatus || isDoneStatus,
          })}
        >
          {isErrorStatus ? (
            <ErrorIcon className="text-error" />
          ) : isScanStatus ? (
            <ScanningIcon />
          ) : isDoneStatus ? (
            <CheckInCircleIcon className="text-success-700" />
          ) : (
            <AttachmentIcon />
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex grow flex-col">
              <h3 className="font-semibold break-all text-gray-800">{fileInfo.fileName}</h3>
              <div className="flex gap-2">
                {isDownloadable && (
                  <ReactAriaButton onPress={onFileDownload}>
                    <DownloadIcon />
                  </ReactAriaButton>
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
              <ButtonNew
                variant="unstyled"
                icon={<CrossInCircleIcon />}
                aria-label={t('aria.removeFile')}
                className={cx('relative -mr-2', {
                  'hover:bg-negative-200 focus:bg-negative-300': isErrorStatus,
                  'hover:bg-success-200 focus:bg-success-300': isDoneStatus,
                })}
                onPress={onFileRemove}
                isDisabled={disabled}
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
          {errorMessage && <div className="text-error max-w-[80%]">{errorMessage}</div>}

          {'canRetry' in fileInfo.status && fileInfo.status.canRetry && (
            <Button
              variant="link-black"
              onPress={onFileRetry}
              text={t('retry')}
              size="sm"
              className="font-semibold"
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default UploadFileCard
