import PinFile from '@assets/images/new-icons/ui/attachment.svg'
import TrashIcon from '@assets/images/new-icons/ui/basket.svg'
import cx from 'classnames'
import { useState } from 'react'

import Spinner from '../../simple-components/Spinner'

interface UploadedFileProps {
  fileName: string
  errorMessage?: string
  isUploading?: boolean
  onRemove?: () => void
}

const UploadedFile = ({ fileName, errorMessage, isUploading, onRemove }: UploadedFileProps) => {
  const classNames = cx(
    'cursor:pointer group linear text-20 flex w-full flex-row gap-2 rounded-lg py-1 px-2 transition-all',
    {
      'text-error': errorMessage,
      'hover:bg-gray-100 hover:text-gray-500': !errorMessage && !isUploading,
    },
  )

  const handleOnRemove = () => {
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <div className={classNames}>
      <div className="mr-2 flex w-full flex-row gap-2">
        <div className="flex flex-col justify-center">
          {isUploading ? <Spinner size="sm" className="self-center" /> : <PinFile />}
        </div>
        <p>{fileName}</p>
      </div>
      <div className="align-center flex w-5 flex-col justify-center gap-2">
        {errorMessage ? (
          <TrashIcon className="cursor-pointer" onClick={handleOnRemove} />
        ) : (
          <TrashIcon
            className="hidden cursor-pointer self-center group-hover:block"
            onClick={handleOnRemove}
          />
        )}
      </div>
    </div>
  )
}

export default UploadedFile
