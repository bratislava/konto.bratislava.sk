import cx from 'classnames'
import { FileInfo } from 'forms-shared/form-files/fileStatus'
import React, { forwardRef } from 'react'

import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'
import UploadButton from './UploadButton'
import UploadDropArea from './UploadDropArea'
import UploadFilesList from './UploadFilesList'

type UploadProps = FieldWrapperProps & {
  type: 'button' | 'dragAndDrop'
  multiple?: boolean
  value?: string | string[] | null
  sizeLimit?: number
  supportedFormats?: string[]
  getFileInfoById: (id: string) => FileInfo
  onUpload?: (files: File[]) => void
  onFileRemove?: (id: string) => void
  onFileRetry?: (id: string) => void
  onFileDownload?: (id: string) => void
  className?: string
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
      helptextFooter,
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
      size,
      labelSize,
      displayOptionalLabel,
    },
    ref,
  ) => {
    return (
      <div className={cx('h-fit w-full', className)} style={{ transition: '0.2 all linear' }}>
        <FieldWrapper
          label={label}
          required={required}
          helptext={helptext}
          helptextFooter={helptextFooter}
          disabled={disabled}
          errorMessage={errorMessage}
          size={size}
          labelSize={labelSize}
          customHeaderBottomMargin="mb-2"
          displayOptionalLabel={displayOptionalLabel}
        >
          <div className="flex flex-col gap-6">
            {type === 'button' && (
              <UploadButton
                ref={ref}
                sizeLimit={sizeLimit}
                supportedFormats={supportedFormats}
                disabled={disabled}
                onUpload={onUpload}
                allowsMultiple={multiple}
                errorMessage={errorMessage}
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
                errorMessage={errorMessage}
              />
            )}

            <UploadFilesList
              value={value}
              getFileInfoById={getFileInfoById}
              onFileRemove={onFileRemove}
              onFileRetry={onFileRetry}
              onFileDownload={onFileDownload}
              disabled={disabled}
            />
          </div>
        </FieldWrapper>
      </div>
    )
  },
)

export default Upload
