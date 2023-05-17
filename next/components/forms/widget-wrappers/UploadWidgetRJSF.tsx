import { UploadMinioFile } from '@backend/dtos/minio/upload-minio-file.dto'
import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React, { useState } from 'react'

import { FileScan, FormRJSFContext } from '../../../frontend/dtos/formStepperDto'
import { getInitInnerValue } from '../../../frontend/utils/formStepper'
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
  onChange: (value?: string | string[]) => void
  rawErrors?: string[]
  formContext: FormRJSFContext
}

const UploadWidgetRJSF = (props: UploadWidgetRJSFProps) => {
  const { options, schema, label, required, value, disabled, onChange, rawErrors, formContext } = props

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

  const [innerValue, setInnerValue] = useState<UploadMinioFile[]>(getInitInnerValue(value, schema, formContext.fileScans))

  const handleOneFile = (files: UploadMinioFile[]) => {
    if (!files[0]?.isUploading && !files[0]?.errorMessage) {
      onChange(files[0]?.file.name)
    } else {
      onChange()
    }
  }

  const handleMultipleFiles = (files: UploadMinioFile[]) => {
    const chosenFileNames: string[] = []
    files.forEach((minioFile) => {
      if (!minioFile.isUploading && !minioFile.errorMessage) {
        chosenFileNames.push(minioFile.file.name)
      }
    })
    if (chosenFileNames.length > 0) {
      onChange(chosenFileNames)
    } else {
      onChange()
    }
  }

  const handleOnChange = (files: UploadMinioFile[]) => {
    setInnerValue(files)
    if (multiple) {
      handleMultipleFiles(files)
    } else {
      handleOneFile(files)
    }
  }

  const getOwnFileScans = () => {
    return formContext.fileScans.filter(fileScan => (
      innerValue.some(value => value.file.name === fileScan.fileName)
    ))
  }

  const handleOnAddFileScans = (newFileScans: FileScan[]) => {
    formContext.fileScans = [ ...formContext.fileScans, ...newFileScans ]
  }

  const handleOnRemoveFileScan = (removeScan?: FileScan) => {
    formContext.fileScans = formContext.fileScans.filter(scan => scan.fileName !== removeScan?.fileName)
  }

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <Upload
        errorMessage={rawErrors}
        type={type}
        label={label}
        required={required}
        multiple={multiple}
        value={innerValue}
        className={className}
        helptext={helptext}
        sizeLimit={size}
        supportedFormats={supportedFormats}
        disabled={disabled}
        userExternalId={formContext.userExternalId}
        pospId={formContext.pospId}
        formId={formContext.formId}
        bucketFolderName={formContext.bucketFolderName}
        fileScans={getOwnFileScans()}
        onChange={handleOnChange}
        onAddFileScans={handleOnAddFileScans}
        onRemoveFileScan={handleOnRemoveFileScan}
      />
    </WidgetWrapper>
  )
}

export default UploadWidgetRJSF
