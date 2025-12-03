import { UploadIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React, { forwardRef } from 'react'
import { Button as ReactAriaButton, FileTrigger } from 'react-aria-components'

import cn from '../../../../frontend/cn'
import {
  getDisplaySupportedFileExtensions,
  getSupportedFileExtensions,
} from '../../../../frontend/utils/formFileUpload'
import PrettyBytes from '../../simple-components/PrettyBytes'

interface UploadButtonProps {
  disabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  fileBrokenMessage?: string[]
  errorMessage?: string[]
  allowsMultiple?: boolean
  onUpload?: (files: File[]) => void
}

const UploadButton = forwardRef<HTMLButtonElement, UploadButtonProps>(
  (
    {
      disabled,
      sizeLimit,
      supportedFormats,
      fileBrokenMessage,
      errorMessage = [],
      onUpload = () => {},
      allowsMultiple,
    },
    ref,
  ) => {
    const { t } = useTranslation('account')

    const displaySupportedFileExtensions = getDisplaySupportedFileExtensions(supportedFormats)

    const buttonClassNames = cn(
      'flex w-full items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-2 lg:w-fit lg:py-3',
      {
        'cursor-pointer': !disabled,
        'hover:border-gray-400 focus:border-gray-700 active:border-gray-700':
          !disabled && (!fileBrokenMessage || fileBrokenMessage.length === 0),
        'border-red-500 hover:border-red-300':
          !disabled && fileBrokenMessage && fileBrokenMessage.length > 0,
        'cursor-not-allowed bg-gray-200 opacity-50': disabled,

        // error
        'border-negative-700 hover:border-negative-700 focus:border-negative-700':
          errorMessage?.length > 0 && !disabled,
      },
    )

    const buttonInfoClassNames = cn('flex flex-col justify-center text-p3', {
      'min-w-40': supportedFormats || sizeLimit,
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

    return (
      <div className="flex gap-x-6 gap-y-3 max-md:flex-col">
        <FileTrigger
          onSelect={handleOnSelect}
          acceptedFileTypes={getSupportedFileExtensions(supportedFormats)}
          allowsMultiple={allowsMultiple}
        >
          <ReactAriaButton className={buttonClassNames} ref={ref} isDisabled={disabled}>
            <div className="flex items-center justify-center gap-2">
              <span>
                <UploadIcon />
              </span>
              <span>{allowsMultiple ? t('Upload.uploadFiles') : t('Upload.uploadFile')}</span>
            </div>
          </ReactAriaButton>
        </FileTrigger>

        {sizeLimit || supportedFormats?.length ? (
          <dl className={buttonInfoClassNames}>
            {sizeLimit ? (
              <>
                <dt className="sr-only">{t('Upload.sizeLimit')}</dt>
                <dd>
                  <PrettyBytes number={sizeLimit * 1000 * 1000} />
                </dd>
              </>
            ) : null}
            {displaySupportedFileExtensions?.length ? (
              <>
                <dt className="sr-only">{t('Upload.supportedFormats')}</dt>
                <dd>{displaySupportedFileExtensions.join(', ')}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </div>
    )
  },
)

export default UploadButton
