import {
  AttachmentIcon,
  CheckInCircleIcon,
  CrossInCircleIcon,
  ErrorIcon,
  ScanningIcon,
} from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  FormFileUploadFileInfo,
  FormFileUploadStatusEnum,
} from '../../../../frontend/types/formFileUploadTypes'
import Button from '../../simple-components/Button'
import ProgressBar from '../../simple-components/ProgressBar'

type UploadedFileProps = {
  fileInfo: FormFileUploadFileInfo
  onFileRemove?: () => void
  onFileRetry?: () => void
}

/**
 * TODO: fileSize
 */
const UploadFileCard = ({ fileInfo, onFileRetry, onFileRemove }: UploadedFileProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'Upload' })
  const fileSize = 500 // not yet implemented in FormFileUploadFileInfo

  const isErrorStyle =
    fileInfo.status.type === FormFileUploadStatusEnum.UploadError ||
    fileInfo.status.type === FormFileUploadStatusEnum.ScanError ||
    fileInfo.status.type === FormFileUploadStatusEnum.ScanInfected ||
    fileInfo.status.type === FormFileUploadStatusEnum.UnknownFile
  const isScanningStyle = fileInfo.status.type === FormFileUploadStatusEnum.Scanning
  const isDoneStyle = fileInfo.status.type === FormFileUploadStatusEnum.ScanDone
  const isDefaultStyle = !isErrorStyle && !isDoneStyle && !isScanningStyle

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className={cx('rounded-lg border-2 w-full p-4 flex gap-4 items-start', {
          'bg-white': isDefaultStyle || isScanningStyle,
          'border-success-700 bg-success-50': isDoneStyle,
          'border-negative-600 bg-negative-50': isErrorStyle,
        })}
      >
        <div
          className={cx('p-3 rounded-lg grow-0 shrink-0 max-md:hidden', {
            'bg-gray-50': isDefaultStyle || isScanningStyle,
            'bg-white': isErrorStyle || isDoneStyle,
          })}
        >
          {isErrorStyle ? (
            <ErrorIcon className="text-error" />
          ) : isScanningStyle ? (
            <ScanningIcon />
          ) : isDoneStyle ? (
            <CheckInCircleIcon className="text-success-700" />
          ) : (
            <AttachmentIcon />
          )}
        </div>

        <div className="flex flex-col w-full gap-2">
          <div className="flex gap-4 justify-between w-full items-center">
            <div className="flex flex-col grow">
              <h3 className="font-bold text-gray-800 break-words">{fileInfo.fileName}</h3>
              <div className="flex gap-2">
                {/* TODO filesize formatting and unit */}
                <span>{fileSize}</span>
                <span>&bull;</span>
                <span>{fileInfo.status.type}</span>
              </div>
            </div>

            <div className="shrink-0 grow-0">
              {/* TODO unified styling */}
              <Button
                variant="plain-black"
                icon={<CrossInCircleIcon />}
                aria-label={t('aria.removeFile')}
                className={cx('-mr-2', {
                  'hover:bg-negative-200 focus:bg-negative-300': isErrorStyle,
                  'hover:bg-success-200 focus:bg-success-300': isDoneStyle,
                })}
                onPress={onFileRemove}
              />
            </div>
          </div>

          {fileInfo.status.type === FormFileUploadStatusEnum.Uploading && (
            <ProgressBar value={fileInfo.status.progress} />
          )}
        </div>
      </div>

      {isErrorStyle && (
        <div className="flex gap-6 justify-between pb-2">
          <div className="text-error">
            {fileInfo.status.type === FormFileUploadStatusEnum.UploadError && fileInfo.status.error}
            {fileInfo.status.type === FormFileUploadStatusEnum.ScanError && t('errors.scanError')}
            {fileInfo.status.type === FormFileUploadStatusEnum.ScanInfected &&
              t('errors.scanInfected')}
            {fileInfo.status.type === FormFileUploadStatusEnum.UnknownFile &&
              t('errors.unknownFile')}
          </div>

          {fileInfo.status.type === FormFileUploadStatusEnum.UploadError &&
            fileInfo.status.canRetry && (
              <Button
                variant="link-black"
                onPress={onFileRetry}
                text={t('retry')}
                size="sm"
                className="font-bold"
              />
            )}
        </div>
      )}
    </div>
  )
}

export default UploadFileCard
