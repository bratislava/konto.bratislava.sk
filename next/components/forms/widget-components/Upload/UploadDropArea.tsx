import { UploadIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React, { forwardRef } from 'react'
import { DropEvent } from 'react-aria'
import {
  Button as ReactAriaButton,
  DropZone,
  DropZoneRenderProps,
  FileTrigger,
} from 'react-aria-components'

import cn from '../../../../frontend/cn'
import {
  getDisplayMaxFileSize,
  getDisplaySupportedFileExtensions,
  getSupportedFileExtensions,
} from '../../../../frontend/utils/formFileUpload'
import { isDefined } from '../../../../frontend/utils/general'
import PrettyBytes from '../../simple-components/PrettyBytes'

interface UploadDropAreaProps {
  disabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  errorMessage?: string[]
  allowsMultiple?: boolean
  onUpload?: (files: File[]) => void
}

const UploadDropArea = forwardRef<HTMLButtonElement, UploadDropAreaProps>(
  (
    {
      disabled,
      sizeLimit,
      supportedFormats,
      errorMessage = [],
      allowsMultiple,
      onUpload = () => {},
    },
    ref,
  ) => {
    const { t } = useTranslation('account', { keyPrefix: 'Upload' })

    const displaySupportedFileExtensions = getDisplaySupportedFileExtensions(supportedFormats)
    const displayMaxFileSize = getDisplayMaxFileSize(sizeLimit)

    const getDropZoneClassName = ({ isDropTarget }: DropZoneRenderProps) =>
      cn('h-full w-full rounded-lg border-2 border-dashed border-gray-300', {
        'bg-white': !disabled && !isDropTarget,
        'cursor-not-allowed bg-gray-200 opacity-50': disabled,
        'cursor-pointer': !disabled,
        'hover:border-gray-400 hover:bg-gray-50 focus:border-gray-700 active:border-gray-700':
          !disabled && !isDropTarget,
        'border-gray-400 bg-gray-50': !disabled && isDropTarget,

        // error
        'border-negative-700 hover:border-negative-700 focus:border-negative-700':
          errorMessage?.length > 0 && !disabled,
      })

    const handleOnSelect = async (files: FileList | null) => {
      if (disabled) {
        return
      }

      if (!files) {
        onUpload([])
        return
      }

      onUpload(Array.from(files))
    }

    const handleOnDrop = async (event: DropEvent) => {
      // DropZone doesn't yet support `isDisabled` prop.
      if (disabled) {
        return
      }

      const filePromises = event.items
        .map((item) => {
          if (item.kind === 'file') {
            return item.getFile()
          }
          return null
          // TODO: Consider implementing folder.
        })
        .filter(isDefined)

      const files = await Promise.all(filePromises)
      onUpload(files)
    }

    return (
      <div className="relative h-40 w-full">
        <DropZone className={getDropZoneClassName} onDrop={handleOnDrop}>
          <FileTrigger
            onSelect={handleOnSelect}
            acceptedFileTypes={getSupportedFileExtensions(supportedFormats)}
            allowsMultiple={allowsMultiple}
            data-cy="file-input"
          >
            <ReactAriaButton
              ref={ref}
              className="flex size-full flex-col items-center justify-evenly p-6 text-center"
              isDisabled={disabled}
            >
              <div className="flex justify-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                  <UploadIcon />
                </div>
              </div>

              <div className="text-16-semibold">
                {allowsMultiple ? t('uploadFiles') : t('uploadFile')}
              </div>

              {sizeLimit || supportedFormats?.length ? (
                <dl className="flex gap-2 text-p3">
                  {displayMaxFileSize ? (
                    <>
                      <dt className="sr-only">{t('sizeLimit')}</dt>
                      <dd>
                        <PrettyBytes number={displayMaxFileSize} />
                      </dd>
                    </>
                  ) : null}
                  {displayMaxFileSize && displaySupportedFileExtensions?.length && (
                    <div aria-hidden>&bull;</div>
                  )}
                  {displaySupportedFileExtensions?.length ? (
                    <>
                      <dt className="sr-only">{t('supportedFormats')}</dt>
                      <dd>{displaySupportedFileExtensions.join(', ')}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </ReactAriaButton>
          </FileTrigger>
        </DropZone>
      </div>
    )
  },
)

export default UploadDropArea
