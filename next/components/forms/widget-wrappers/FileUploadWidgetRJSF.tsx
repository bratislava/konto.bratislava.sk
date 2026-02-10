import { WidgetProps } from '@rjsf/utils'
import { FileUploadUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

import { useFormFileUpload } from '../useFormFileUpload'
import Upload from '../widget-components/Upload/Upload'

interface FileUploadWidgetRJSFProps extends WidgetProps {
  options: FileUploadUiOptions
  value: string | undefined
  onChange: (value?: string | undefined) => void
}

const FileUploadWidgetRJSF = ({
  id,
  options,
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
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    type = 'button',
    className,
    size,
    labelSize,
  } = options

  const supportedFormats = accept?.split(',')
  const constraints = { supportedFormats, maxFileSize: sizeLimit }

  const formFileUpload = useFormFileUpload()

  const handleUpload = (files: File[]) => {
    const ids = formFileUpload.uploadFiles(files, constraints)
    if (ids.length === 0) {
      return
    }

    if (value) {
      formFileUpload.removeFiles([value])
    }
    onChange(ids[0])
  }

  const handleFileRemove = (fileId: string) => {
    onChange()
    formFileUpload.removeFiles([fileId])
  }

  const handleFileRetry = (fileId: string) => {
    const newId = formFileUpload.retryFile(fileId, constraints)
    if (newId) {
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
        multiple={false}
        className={className}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
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
