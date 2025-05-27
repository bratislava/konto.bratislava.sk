import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { FileUploadUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import { useFormFileUpload } from '../useFormFileUpload'
import Upload from '../widget-components/Upload/Upload'

interface FileUploadMultipleWidgetRJSFProps extends WidgetProps {
  options: FileUploadUiOptions
  value: string[] | undefined
  onChange: (value?: string[] | undefined) => void
}

const FileUploadMultipleWidgetRJSF = ({
  id,
  options,
  label,
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
}: FileUploadMultipleWidgetRJSFProps) => {
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

    onChange([...(value ?? []), ...ids])
  }

  const handleFileRemove = (fileId: string) => {
    if (!value) {
      return
    }

    onChange(value.filter((valueInner) => valueInner !== fileId))
    formFileUpload.removeFiles([fileId])
  }

  const handleFileRetry = (fileId: string) => {
    const newId = formFileUpload.retryFile(fileId, constraints)
    if (!newId || !value) {
      return
    }

    // Replaces the old id with the new one.
    onChange(value.map((valueInner) => (valueInner === fileId ? newId : valueInner)))
  }

  return (
    <WidgetWrapper id={id} options={options} className="w-full">
      <Upload
        value={value}
        errorMessage={rawErrors}
        type={type}
        label={label}
        required={required}
        multiple
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

export default FileUploadMultipleWidgetRJSF
