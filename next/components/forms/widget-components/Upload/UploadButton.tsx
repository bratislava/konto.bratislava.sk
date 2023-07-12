import UploadIcon from '@assets/images/new-icons/ui/upload.svg'
import cx from 'classnames'
import React, { forwardRef } from 'react'
import { Button, FileTrigger } from 'react-aria-components'

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
    const buttonClassNames = cx(
      'h-full flex-col justify-center flex rounded-lg border-2 border-gray-300 py-3 px-4 bg-white',
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
      <div className="flex flex-row gap-4 w-fit h-fit">
        <FileTrigger
          onChange={handleOnChange}
          acceptedFileTypes={supportedFormats}
          allowsMultiple={allowsMultiple}
        >
          <Button className={buttonClassNames} ref={ref} isDisabled={disabled}>
            <div className="w-full flex gap-2">
              <div className="h-6 w-6 flex justify-center items-center">
                <UploadIcon className="w-6 h-6" />
              </div>
              <div className="text-16">Upload</div>
            </div>
          </Button>
        </FileTrigger>

        {sizeLimit || supportedFormats ? (
          <div className={buttonInfoClassNames}>
            <p>
              {sizeLimit} {sizeLimit && 'MB'}
            </p>
            <p>{supportedFormats?.join(' ')}</p>
          </div>
        ) : null}
      </div>
    )
  },
)

export default UploadButton
