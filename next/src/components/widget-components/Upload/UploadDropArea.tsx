import { useTranslation } from 'next-i18next/pages'
import React, { forwardRef } from 'react'
import { DropEvent } from 'react-aria'
import {
  Button as ReactAriaButton,
  DropZone,
  DropZoneRenderProps,
  FileTrigger,
} from 'react-aria-components'

import { UploadIcon } from '@/src/assets/ui-icons'
import PrettyBytes from '@/src/components/simple-components/PrettyBytes'
import {
  getDisplayMaxFileSize,
  getDisplaySupportedFileExtensions,
  getSupportedFileExtensions,
} from '@/src/frontend/utils/formFileUpload'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'

interface UploadDropAreaProps {
  isDisabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  errorMessage?: string[]
  allowsMultiple?: boolean
  onUpload?: (files: File[]) => void
}

const UploadDropArea = forwardRef<HTMLButtonElement, UploadDropAreaProps>(
  (
    {
      isDisabled,
      sizeLimit,
      supportedFormats,
      errorMessage = [],
      allowsMultiple,
      onUpload = () => {},
    },
    ref,
  ) => {
    const { t } = useTranslation('account')

    const displaySupportedFileExtensions = getDisplaySupportedFileExtensions(supportedFormats)
    const displayMaxFileSize = getDisplayMaxFileSize(sizeLimit)

    const getDropZoneClassName = ({ isDropTarget }: DropZoneRenderProps) =>
      cn('h-full w-full rounded-lg border border-dashed border-gray-300', {
        'bg-white': !isDisabled && !isDropTarget,
        'cursor-not-allowed bg-gray-200 opacity-50': isDisabled,
        'cursor-pointer': !isDisabled,
        'hover:border-gray-400 hover:bg-gray-50 focus:border-gray-700 active:border-gray-700':
          !isDisabled && !isDropTarget,
        'border-gray-400 bg-gray-50': !isDisabled && isDropTarget,

        // error
        'border-negative-700 hover:border-negative-700 focus:border-negative-700':
          errorMessage?.length > 0 && !isDisabled,
      })

    const handleOnSelect = async (files: FileList | null) => {
      if (isDisabled) {
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
      if (isDisabled) {
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
              isDisabled={isDisabled}
            >
              <div className="flex justify-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                  <UploadIcon />
                </div>
              </div>

              <div className="text-16-semibold">
                {allowsMultiple ? t('Upload.uploadFiles') : t('Upload.uploadFile')}
              </div>

              {sizeLimit || supportedFormats?.length ? (
                <dl className="text-p3 flex gap-2">
                  {displayMaxFileSize ? (
                    <>
                      <dt className="sr-only">{t('Upload.sizeLimit')}</dt>
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
                      <dt className="sr-only">{t('Upload.supportedFormats')}</dt>
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
