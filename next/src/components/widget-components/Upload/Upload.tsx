import { FileInfo } from 'forms-shared/form-files/fileStatus'
import React, { forwardRef } from 'react'

import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

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
      multiple,
      value,
      sizeLimit,
      supportedFormats,
      getFileInfoById,
      onUpload = () => {},
      onFileRemove = () => {},
      onFileRetry = () => {},
      onFileDownload = () => {},
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div className={cn('h-fit w-full', className)} style={{ transition: '0.2 all linear' }}>
        <FieldWrapper {...rest} customHeaderBottomMargin="mb-2">
          <div className="flex flex-col gap-6">
            {type === 'button' && (
              <UploadButton
                ref={ref}
                sizeLimit={sizeLimit}
                supportedFormats={supportedFormats}
                disabled={rest.disabled}
                onUpload={onUpload}
                allowsMultiple={multiple}
                errorMessage={rest.errorMessage}
              />
            )}
            {type === 'dragAndDrop' && (
              <UploadDropArea
                ref={ref}
                sizeLimit={sizeLimit}
                supportedFormats={supportedFormats}
                disabled={rest.disabled}
                onUpload={onUpload}
                allowsMultiple={multiple}
                errorMessage={rest.errorMessage}
              />
            )}

            <UploadFilesList
              value={value}
              getFileInfoById={getFileInfoById}
              onFileRemove={onFileRemove}
              onFileRetry={onFileRetry}
              onFileDownload={onFileDownload}
              disabled={rest.disabled}
            />
          </div>
        </FieldWrapper>
      </div>
    )
  },
)

export default Upload
