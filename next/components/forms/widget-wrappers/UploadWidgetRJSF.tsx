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
  const { options, schema, label, required, value, disabled, onChange, rawErrors, formContext } =
    props

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

  const [innerValue, setInnerValue] = useState<UploadMinioFile[]>(
    getInitInnerValue(value, schema, formContext.fileScans),
  )
  const [innerFileScans, setInnerFileScans] = useState<FileScan[]>(formContext.fileScans)

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
    return innerFileScans.filter((fileScan) =>
      innerValue.some((value) => value.file.name === fileScan.fileName),
    )
  }

  const handleOnUpdateFileScans = (
    updatedNewFileScans: FileScan[],
    removeFileScan?: FileScan | null,
  ) => {
    setInnerFileScans(updatedNewFileScans)

    const updatedFormContextFileScans = [...formContext.fileScans, ...updatedNewFileScans].filter(
      (scan) =>
        scan.fileName !== removeFileScan?.fileName && scan.scanId !== removeFileScan?.scanId,
    )

    formContext.setFileScans(
      updatedFormContextFileScans.concat(
        updatedNewFileScans.filter(
          (innerScan) =>
            !updatedFormContextFileScans.some(
              (formContextScan) => JSON.stringify(formContextScan) === JSON.stringify(innerScan),
            ),
        ),
      ),
    )
  }

  const handleOnRemoveFileScan = (removeScan?: FileScan) => {
    const updatedFormContextFileScans = formContext.fileScans.filter(
      (scan) => scan.fileName !== removeScan?.fileName,
    )
    const updatedInnerFileScans = innerFileScans.filter(
      (scan) => scan.fileName !== removeScan?.fileName,
    )

    formContext.setFileScans(
      updatedFormContextFileScans.concat(
        updatedInnerFileScans.filter(
          (innerScan) =>
            !updatedFormContextFileScans.some(
              (formContextScan) => JSON.stringify(formContextScan) === JSON.stringify(innerScan),
            ),
        ),
      ),
    )

    setInnerFileScans(updatedInnerFileScans)
  }

  return (
    <WidgetWrapper
      accordion={accordion}
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
      className="w-full"
    >
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
        onUpdateFileScans={handleOnUpdateFileScans}
        onRemoveFileScan={handleOnRemoveFileScan}
      />
    </WidgetWrapper>
  )
}

export default UploadWidgetRJSF
