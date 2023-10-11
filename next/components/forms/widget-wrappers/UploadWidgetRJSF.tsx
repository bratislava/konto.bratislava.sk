import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { UploadUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import { useFormFileUpload } from '../useFormFileUpload'
import Upload from '../widget-components/Upload/Upload'

interface UploadWidgetRJSFProps extends WidgetProps {
  options: UploadUiOptions & WidgetProps['options']
  schema: StrictRJSFSchema
  value: string | string[] | null
  multiple?: boolean
  onChange: (value?: string | string[] | null) => void
}

const UploadWidgetRJSF = ({
  options,
  schema,
  label,
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
}: UploadWidgetRJSFProps) => {
  const { size, accept, helptext, type = 'button', className } = options

  const supportedFormats = accept?.split(',')
  const multiple = schema.type === 'array'
  const constraints = { supportedFormats, maxFileSize: size }

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

  const handleFileRemove = (id: string) => {
    if (multiple) {
      onChange((value as string[]).filter((v) => v !== id))
    } else {
      onChange(null)
    }

    formFileUpload.removeFiles([id])
  }

  const handleFileRetry = (id: string) => {
    const newId = formFileUpload.retryFile(id, constraints)
    if (!newId) {
      return
    }

    if (multiple) {
      // Replaces the old id with the new one.
      onChange((value as string[]).map((value) => (value === id ? newId : value)))
    } else {
      onChange(newId)
    }
  }

  return (
    <WidgetWrapper options={options} className="w-full">
      <Upload
        value={value}
        errorMessage={rawErrors}
        type={type}
        label={label}
        required={required}
        multiple={multiple}
        className={className}
        helptext={helptext}
        sizeLimit={size}
        supportedFormats={supportedFormats}
        disabled={disabled || readonly}
        onUpload={handleUpload}
        onFileRemove={handleFileRemove}
        onFileRetry={handleFileRetry}
        onFileDownload={formFileUpload.downloadFile}
        getFileInfoById={formFileUpload.getFileInfoById}
      />
    </WidgetWrapper>
  )
}

export default UploadWidgetRJSF
