import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { FileUploadUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import { useFormFileUpload } from '../useFormFileUpload'
import Upload from '../widget-components/Upload/Upload'

interface FileUploadWidgetRJSFProps extends WidgetProps {
  options: FileUploadUiOptions
  schema: StrictRJSFSchema
  value: string | string[] | null
  multiple?: boolean
  onChange: (value?: string | string[] | null) => void
}

const FileUploadWidgetRJSF = ({
  id,
  options,
  schema,
  label,
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
}: FileUploadWidgetRJSFProps) => {
  const {
    sizeLimit,
    accept,
    helptext,
    helptextHeader,
    type = 'button',
    className,
    size,
    labelSize,
  } = options

  const supportedFormats = accept?.split(',')
  const multiple = schema.type === 'array'
  const constraints = { supportedFormats, maxFileSize: sizeLimit }

  const formFileUpload = useFormFileUpload()

  const handleUpload = (files: File[]) => {
    const ids = formFileUpload.uploadFiles(files, constraints)
    if (ids.length === 0) {
      return
    }

    if (multiple) {
      onChange([...(value as string[]), ...ids])
    } else {
      if (value) {
        formFileUpload.removeFiles([value as string])
      }
      onChange(ids[0])
    }
  }

  const handleFileRemove = (fileId: string) => {
    if (multiple) {
      onChange((value as string[]).filter((v) => v !== fileId))
    } else {
      onChange(null)
    }

    formFileUpload.removeFiles([fileId])
  }

  const handleFileRetry = (fileId: string) => {
    const newId = formFileUpload.retryFile(fileId, constraints)
    if (!newId) {
      return
    }

    if (multiple) {
      // Replaces the old id with the new one.
      onChange((value as string[]).map((value) => (value === fileId ? newId : value)))
    } else {
      onChange(newId)
    }
  }

  return (
    <WidgetWrapper id={id} options={options} className="w-full">
      <Upload
        value={value}
        errorMessage={rawErrors}
        type={type}
        label={label}
        required={required}
        multiple={multiple}
        className={className}
        helptext={helptext}
        helptextHeader={helptextHeader}
        sizeLimit={sizeLimit}
        supportedFormats={supportedFormats}
        disabled={disabled || readonly}
        onUpload={handleUpload}
        onFileRemove={handleFileRemove}
        onFileRetry={handleFileRetry}
        onFileDownload={formFileUpload.downloadFile}
        getFileInfoById={formFileUpload.getFileInfoById}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel
      />
    </WidgetWrapper>
  )
}

export default FileUploadWidgetRJSF
