import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import { useFormFileUpload } from '../useFormFileUpload'
import Upload from '../widget-components/Upload/Upload'
import UploadRJSFOptions from '../widget-components/Upload/UploadRJSFOptions'

interface UploadWidgetRJSFProps extends WidgetProps {
  options: UploadRJSFOptions
  schema: StrictRJSFSchema
  label: string
  required?: boolean
  value: string | string[] | null
  disabled?: boolean
  multiple?: boolean
  onChange: (value?: string | string[] | null) => void
  rawErrors?: string[]
}

const UploadWidgetRJSF = (props: UploadWidgetRJSFProps) => {
  const { options, schema, label, required, value, disabled, onChange, rawErrors } = props

  const {
    size,
    accept,
    helptext,
    type = 'button',
    className,
    accordion,
    spaceBottom = 'none',
    spaceTop = 'large',
  } = options

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
    <WidgetWrapper
      accordion={accordion}
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
      className="w-full"
    >
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
        disabled={disabled}
        onUpload={handleUpload}
        onFileRemove={handleFileRemove}
        onFileRetry={handleFileRetry}
        getFileInfoById={formFileUpload.getFileInfoById}
      />
    </WidgetWrapper>
  )
}

export default UploadWidgetRJSF
