import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { FileUploadUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import { useFormFileUpload } from '@/components/forms/useFormFileUpload'
import Upload from '@/components/forms/widget-components/Upload/Upload'
import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

interface FileUploadMultipleWidgetRJSFProps extends WidgetProps {
  options: FileUploadUiOptions
  value: string[] | undefined
  schema: StrictRJSFSchema
  onChange: (value?: string[] | undefined) => void
}

const FileUploadMultipleWidgetRJSF = ({
  id,
  options,
  label,
  required,
  value,
  schema: { maxItems },
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
  const filesCount = value?.length ?? 0
  const hasMaxItems = typeof maxItems === 'number'
  const remainingSlots = hasMaxItems ? Math.max(0, maxItems - filesCount) : Infinity
  const isAtMaxItems = hasMaxItems && remainingSlots === 0
  const allowsMultipleSelection = !hasMaxItems || remainingSlots > 1

  const handleUpload = (files: File[]) => {
    const acceptedFiles = files.slice(0, remainingSlots)
    const ids = formFileUpload.uploadFiles(acceptedFiles, constraints)
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
        multiple={allowsMultipleSelection}
        className={className}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        sizeLimit={sizeLimit}
        supportedFormats={supportedFormats}
        disabled={disabled || readonly}
        uploadDisabled={isAtMaxItems}
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
