import { UploadIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { forwardRef } from 'react'
import { Button as ReactAriaButton, FileTrigger } from 'react-aria-components'

interface UploadButtonProps {
  disabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  fileBrokenMessage?: string[]
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
      onUpload = () => {},
      allowsMultiple,
    },
    ref,
  ) => {
    const { t } = useTranslation('account', { keyPrefix: 'Upload' })

    const buttonClassNames = cx(
      'w-full lg:w-fit lg:py-3 justify-center flex items-center rounded-lg border-2 border-gray-300 py-2 px-6 bg-white',
      {
        'cursor-pointer': !disabled,
        'hover:border-gray-400 focus:border-gray-700 active:border-gray-700':
          !disabled && (!fileBrokenMessage || fileBrokenMessage.length === 0),
        'border-red-500 hover:border-red-300':
          !disabled && fileBrokenMessage && fileBrokenMessage.length > 0,
        'opacity-50 cursor-not-allowed bg-gray-200': disabled,
      },
    )

    const buttonInfoClassNames = cx('text-p3 flex flex-col justify-center', {
      'min-w-40': supportedFormats || sizeLimit,
    })

    const handleOnChange = async (files: FileList | null) => {
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
          onChange={handleOnChange}
          acceptedFileTypes={supportedFormats}
          allowsMultiple={allowsMultiple}
          className="flex"
        >
          <ReactAriaButton className={buttonClassNames} ref={ref} isDisabled={disabled}>
            <div className="flex gap-2 justify-center items-center">
              <span>
                <UploadIcon />
              </span>
              <span>{t('uploadFiles')}</span>
            </div>
          </ReactAriaButton>
        </FileTrigger>

        {sizeLimit || supportedFormats?.length ? (
          <dl className={buttonInfoClassNames}>
            {sizeLimit ? (
              <>
                <dt className="sr-only">{t('sizeLimit')}</dt>
                {/* TODO format fileSize */}
                <dd>{`${sizeLimit} MB`}</dd>
              </>
            ) : null}
            {supportedFormats?.length ? (
              <>
                <dt className="sr-only">{t('supportedFormats')}</dt>
                <dd>{supportedFormats.join(' ')}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </div>
    )
  },
)

export default UploadButton
