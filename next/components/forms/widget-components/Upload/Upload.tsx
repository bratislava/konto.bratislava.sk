import cx from 'classnames'
import FieldErrorMessage from 'components/forms/info-components/FieldErrorMessage'
import React, { forwardRef } from 'react'

import { FormFileUploadFileInfo } from '../../../../frontend/types/formFileUploadTypes'
import UploadFieldHeader from '../../info-components/UploadFieldHeader'
import UploadButton from './UploadButton'
import UploadDropArea from './UploadDropArea'
import UploadFilesList from './UploadFilesList'

interface UploadProps {
  type: 'button' | 'dragAndDrop'
  label?: string
  required?: boolean
  multiple?: boolean
  value?: string | string[] | null
  helptext?: string
  disabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  className?: string
  errorMessage?: string[]
  getFileInfoById: (id: string) => FormFileUploadFileInfo
  onUpload?: (files: File[]) => void
  onFileRemove?: (id: string) => void
  onFileRetry?: (id: string) => void
  onFileDownload?: (id: string) => void
}

const Upload = forwardRef<HTMLButtonElement, UploadProps>(
  (
    {
      type,
      label,
      required,
      multiple,
      value,
      helptext,
      disabled,
      sizeLimit,
      supportedFormats,
      className,
      getFileInfoById,
      errorMessage,
      onUpload = () => {},
      onFileRemove = () => {},
      onFileRetry = () => {},
      onFileDownload = () => {},
    },
    ref,
  ) => {
    return (
      <section
        className={cx('select-none w-full h-fit', className)}
        style={{ transition: '0.2 all linear' }}
      >
        <UploadFieldHeader label={label ?? ''} required={required} helptext={helptext} />
        <div className="flex flex-col gap-6">
          {type === 'button' && (
            <UploadButton
              ref={ref}
              sizeLimit={sizeLimit}
              supportedFormats={supportedFormats}
              disabled={disabled}
              onUpload={onUpload}
              allowsMultiple={multiple}
            />
          )}
          {type === 'dragAndDrop' && (
            <UploadDropArea
              ref={ref}
              sizeLimit={sizeLimit}
              supportedFormats={supportedFormats}
              disabled={disabled}
              onUpload={onUpload}
              allowsMultiple={multiple}
            />
          )}

          <UploadFilesList
            value={value}
            getFileInfoById={getFileInfoById}
            onFileRemove={onFileRemove}
            onFileRetry={onFileRetry}
            onFileDownload={onFileDownload}
          />
        </div>

        {!disabled && <FieldErrorMessage errorMessage={errorMessage} />}
      </section>
    )
  },
)

export default Upload
