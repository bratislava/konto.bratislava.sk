import BallDelimiterIcon from '@assets/images/forms/ball_delimiter_icon.svg'
import UploadIcon from '@assets/images/new-icons/ui/upload.svg'
import cx from 'classnames'
import React, { forwardRef } from 'react'
import { DropEvent } from 'react-aria'
import { Button, DropZone, DropZoneRenderProps, FileTrigger } from 'react-aria-components'

import { isDefined } from '../../../../frontend/utils/general'

interface UploadDropAreaProps {
  disabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  allowsMultiple?: boolean
  onUpload?: (files: File[]) => void
}

const UploadDropArea = forwardRef<HTMLButtonElement, UploadDropAreaProps>(
  ({ disabled, sizeLimit, supportedFormats, allowsMultiple, onUpload = () => {} }, ref) => {
    const getDropZoneClassName = ({ isDropTarget }: DropZoneRenderProps) =>
      cx('h-full w-full rounded-lg border-2 border-dashed border-gray-300', {
        'bg-white': !disabled && !isDropTarget,
        'opacity-50 bg-gray-200 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
        'hover:border-gray-400 focus:border-gray-700 active:border-gray-700 hover:bg-gray-50':
          !disabled && !isDropTarget,
        'border-gray-400 bg-gray-50': !disabled && isDropTarget,
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
      <div className="w-full relative h-40">
        <DropZone className={getDropZoneClassName} onDrop={handleOnDrop}>
          <FileTrigger onChange={handleOnChange} allowsMultiple={allowsMultiple} className="h-full">
            <Button
              ref={ref}
              className="w-full h-full flex flex-col items-center justify-evenly p-6 text-center"
              isDisabled={disabled}
            >
              <div className="flex flex-row justify-center">
                <div className="flex h-12 w-12 flex-row justify-center items-center rounded-full bg-gray-200">
                  <UploadIcon className="w-6 h-6" />
                </div>
              </div>
              <h5 className="text-16-semibold">Drag & drop upload</h5>
              <div className="text-p3 flex flex-row justify-center gap-1">
                <p>
                  {sizeLimit} {sizeLimit && 'MB'}
                </p>
                {sizeLimit && supportedFormats && supportedFormats.length > 0 && (
                  <div className="grid grid-cols-1 content-center">
                    <BallDelimiterIcon />
                  </div>
                )}
                <p>{supportedFormats?.join(' ')}</p>
              </div>
            </Button>
          </FileTrigger>
        </DropZone>
      </div>
    )
  },
)

export default UploadDropArea
